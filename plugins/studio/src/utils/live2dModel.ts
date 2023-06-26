require('./assets/live2d.min.js');
require('./assets/live2dcubismcore.min.js');
import { ShaderSystem } from '@pixi/core';
import { install } from '@pixi/unsafe-eval';
import KalmanFilter from 'kalmanjs';

// Apply the patch to PIXI to fix unsafe-eval issue for manifest v3
install({ ShaderSystem });

import * as PIXI from 'pixi.js';
// Need a global PIXI variable in window, because Live2DModel internally
// implements functionality from it, such as window.PIXI.Ticker
// https://github.com/guansss/pixi-live2d-display/blob/master/README.md#basic
(window as any).PIXI = PIXI;
// accordingly, here we should use require() to import the module,
// instead of the import statement because the latter will be hoisted
// over the above assignment when compiling the script
const { Live2DModel } = require('pixi-live2d-display');

import { AvatarModel } from '../types';
import {
  rangeTransform,
  faceRotationToBlendshapes,
  undefTo0,
} from './faceUtils';
import constants from '../config/constants';

const RESTORATION_SLEEP_MS = 3000;
const PIXI_WINDOW_RATIO = 16 / 9;
const EXPRESSION_SPEED =
  (!!(window as any).chrome) || (navigator.userAgent.indexOf("Firefox") > -1)
    ? 0.05
    : 0.2;
const INITIAL_MODEL_X = 0.5;
const INITIAL_MODEL_Y = 0.5;
const INITIAL_SIZE_FACTOR = 1;
const INITIAL_FACE_X = 0.5;
const INITIAL_FACE_Y = 0.5;
const INITIAL_FACE_FACTOR = 1;
const FACE_MOVE_MULTIPLIER = 0.65;
const FACE_DEPTH_MULTIPLIER = 4;
const HEAD_YAW_MULTIPLIER = -200;
const HEAD_PITCH_MULTIPLIER = -400;
const HEAD_ROLL_MULTIPLIER = 200;
const BODY_YAW_MULTIPLIER = -30;

export class Live2dModel extends AvatarModel {
  private app: PIXI.Application;
  private loadingModel: boolean;
  private live2dModel: any;
  private data: any;
  private backgroundImage?: HTMLImageElement;
  private backgroundImageSrc?: string;
  private backgroundImageWidth?: number;
  private backgroundImageHeight?: number;
  private backgroundColor?: string;
  private modelVersion: number = 4;
  private angleZParamIndex: number = 0;
  private eyeWidenable: boolean = false;
  private modelX: number = INITIAL_MODEL_X;
  private modelY: number = INITIAL_MODEL_Y;
  private sizeFactor: number = INITIAL_SIZE_FACTOR;
  private faceX: number = INITIAL_FACE_X;
  private faceY: number = INITIAL_FACE_Y;
  private faceFactor: number = INITIAL_FACE_FACTOR;
  private headXKalmanFilter: KalmanFilter;
  private headYKalmanFilter: KalmanFilter;
  private headZKalmanFilter: KalmanFilter;
  private expressions: Map<string, Array<object>>;
  private activeExpressions: string[];
  private defaultExpressionValues: Map<string, number>;
  private desiredExpressionValues: Map<string, number>;
  private currExpressionValues: Map<string, number>;

  public constructor(
    showDefaultBackground = false,
    expressions?: Map<string, Array<object>>,
    defaultBackground?: string,
    defaultModelSize?: number,
  ) {
    super('Live2dModel');

    // Generate canvas
    this.canvas = document.getElementById('live2d-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.setAttribute('id', 'live2d-canvas');
    }

    this.canvas.addEventListener('webglcontextlost', (e) => {
      console.log('==== AvatarModel WebGL context lost ====');
      e.preventDefault();
      this.onWebglContextLost();
    }, false);
    this.canvas.addEventListener('webglcontextrestored', async () => {
      console.log('==== AvatarModel WebGL context restored ====');
      await this.onWebglContextRestored();
    }, false);

    const pixiHeight = window.innerHeight;
    const pixiWidth = pixiHeight * PIXI_WINDOW_RATIO;

    // create PIXI app that hosts all live2d assets
    this.app = new PIXI.Application({
      view: this.canvas,
      autoStart: true,
      width: pixiWidth,
      height: pixiHeight,
      backgroundAlpha: 0
    });

    // locking to make sure we don't load two models at the same time
    this.loadingModel = false;

    // Set default background
    if (showDefaultBackground) {
      this.backgroundImage = new Image();
      this.backgroundImage.crossOrigin = 'anonymous';
      // optimization note: frequently accessing DOM element attributes can be
      // slow, caching this.backgroundImage.src (which is a string) here
      this.backgroundImageSrc = defaultBackground ?? constants.assets.defaultBackground;
      this.backgroundImage.src = this.backgroundImageSrc;
      this.backgroundImageWidth = constants.video.videoWidth;
      this.backgroundImageHeight = constants.video.videoHeight;
    }

    // Kalman filter for head motion
    // R is the measurement noise, Q is the motion inherent noise
    this.headXKalmanFilter = new KalmanFilter({ R: 0.1, Q: 0.5 });
    this.headYKalmanFilter = new KalmanFilter({ R: 0.1, Q: 0.5 });
    this.headZKalmanFilter = new KalmanFilter({ R: 0.1, Q: 0.5 });

    // Initialize expressions
    this.activeExpressions = [] as string[];
    this.defaultExpressionValues = new Map();
    this.desiredExpressionValues = new Map();
    this.currExpressionValues = new Map();
    this.initExpressions(expressions);
  }

  public loadFile = async (data: any) => {
    if (this.loadingModel || !this.canvas) {
      return;
    }
    this.loadingModel = true;
    console.log('---- LOADING LIVE2D MODEL ---- ');

    // Check if PIXI app already contains a live2d model, if so, clear
    // out to make room for the new model
    if (this.live2dModel) {
      this.app.stage.removeChild(this.live2dModel);
      this.live2dModel.destroy();
    }

    // load live2d model
    this.live2dModel = await Live2DModel.from(data, {
      autoInteract: false,
      idleMotionGroup: 'none',
    });

    // cache the data for potentially restore live2d model
    this.data = data;

    // scale the model
    const scale = Math.min(
      this.canvas.width / this.live2dModel.width,
      this.canvas.height / this.live2dModel.height) * 0.85;
    this.live2dModel.scale.x = scale;
    this.live2dModel.scale.y = scale;

    // center the model
    this.live2dModel.position.x =
      this.canvas.width / 2 - this.live2dModel.width / 2;
    this.live2dModel.position.y =
      this.canvas.height / 2 - this.live2dModel.height / 2;

    // attach the model to scene
    this.app.stage.addChild(this.live2dModel);

    // determine model version
    if (this.live2dModel.internalModel.coreModel.getParamIndex) {
      this.modelVersion = 2;
    } else {
      this.modelVersion = 4;
    }

    // pre store parameter indicies
    if (this.modelVersion == 2) {
      this.angleZParamIndex = this.live2dModel.internalModel.coreModel.getParamIndex('PARAM_ANGLE_Z');
    }

    // disable v4's default eye blinking
    if (this.modelVersion == 4) {
      this.live2dModel.internalModel.eyeBlink = undefined;
    }

    // check if this model supports eye widening
    if (this.modelVersion == 4) {
      let coreModel = this.live2dModel.internalModel.coreModel;  // shorthand
      if (coreModel.getParameterMaximumValue(coreModel.getParameterIndex('ParamEyeLOpen')) > 1 ||
        coreModel.getParameterMaximumValue(coreModel.getParameterIndex('ParamEyeROpen')) > 1) {
        this.eyeWidenable = true;
      }
    }

    // read default expression parameters
    if (this.modelVersion == 4) {
      this.assignExpressionValues();
    }

    // mark finishing of model loading
    this.loadingModel = false;
    console.log('---- LIVE2D MODEL LOADED ---- ');
  }

  public initExpressions = (expressions: Map<string, object[]>) => {
    if (expressions) {
      this.expressions = expressions;
    } else {
      this.expressions = new Map();
    }
    // find default expression values
    this.assignExpressionValues();
  };

  public assignExpressionValues = () => {
    if (this.live2dModel && this.modelVersion == 4) {
      const coreModel = this.live2dModel.internalModel.coreModel;  // shorthand
      this.expressions.forEach((expression, key) => {
        for (const exp of expression) {
          const defaultValue = coreModel.getParameterDefaultValue(
            coreModel.getParameterIndex(exp['Id'])
          );
          this.defaultExpressionValues.set(key + exp['Id'], defaultValue);
          this.desiredExpressionValues.set(key + exp['Id'], defaultValue);
          this.currExpressionValues.set(key + exp['Id'], defaultValue);
        }
      });
    } else {
      this.expressions.forEach((expression, key) => {
        for (const exp of expression) {
          this.defaultExpressionValues.set(key + exp['Id'], 0);
          this.desiredExpressionValues.set(key + exp['Id'], 0);
          this.currExpressionValues.set(key + exp['Id'], 0);
        }
      });
    }
  }

  // Activate selected expressions
  public activateExpressions = (expNames: string[]) => {
    // Deactivate first, by setting the desired expression value to 0
    const expToDeactivate = this.activeExpressions.filter(
      (exp: string) => !expNames.includes(exp)
    );
    for (const expName of expToDeactivate) {
      const currExp = this.expressions.get(expName);
      for (const exp of currExp!) {
        this.desiredExpressionValues.set(expName + exp['Id'],
          this.defaultExpressionValues.get(expName + exp['Id'])
        );
      }
    }
    // Add new expressions to active list
    const expToAdd = expNames.filter(
      (exp: string) => !this.activeExpressions.includes(exp)
    );
    for (const expName of expToAdd) {
      const currExp = this.expressions.get(expName);
      if (currExp) {
        // expName exists in the expression list
        for (const exp of currExp) {
          this.desiredExpressionValues.set(expName + exp['Id'], exp['Value']);
        }
        this.activeExpressions.push(expName);
      }
    }
  };

  // Helper function for enabling or disabling expressions
  private applyExpressions = () => {
    if (this.activeExpressions.length > 0 && this.live2dModel) {
      const coreModel = this.live2dModel.internalModel.coreModel;  // shorthand
      let expToRemove = [];
      for (const expName of this.activeExpressions) {
        const currExp = this.expressions.get(expName);
        let allExpValuesZero = true;
        for (const exp of currExp!) {
          const expKey = expName + exp['Id'];
          const currExpValue = this.currExpressionValues.get(expKey);
          const desiredExpValue = this.desiredExpressionValues.get(expKey);
          const defaultValue = this.defaultExpressionValues.get(expKey);
          let nextExpValue = currExpValue;
          if (desiredExpValue > currExpValue) {
            nextExpValue = Math.min(currExpValue + EXPRESSION_SPEED, desiredExpValue);
          } else if (desiredExpValue < currExpValue) {
            nextExpValue = Math.max(currExpValue - EXPRESSION_SPEED, desiredExpValue);
          }
          coreModel.setParameterValueById(exp['Id'], nextExpValue);
          this.currExpressionValues.set(expKey, nextExpValue);
          if (nextExpValue != defaultValue) allExpValuesZero = false;
        }
        // all parameters are zero, can remove this expression
        if (allExpValuesZero) {
          expToRemove.push(expName);
        }
      }
      // remove expressions from active expression list
      for (const exp of expToRemove) {
        const idx = this.activeExpressions.indexOf(exp);
        if (idx > -1) {
          this.activeExpressions.splice(idx, 1); // 2nd parameter means remove one item only
        }
      }
    }
  };

  public updateFrame = (prediction: any) => {
    if (this.live2dModel && prediction && !this.loadingModel && this.canvas) {

      // convert blendshapes back to dictionary for faster lookup
      let blendshapes = Object.fromEntries(prediction.blendshapes);

      let eyeBlinkLeft = rangeTransform(0, 0.5, 1, 0, undefTo0(blendshapes['eyeBlink_L']));
      let eyeBlinkRight = rangeTransform(0, 0.5, 1, 0, undefTo0(blendshapes['eyeBlink_R']));
      let jawOpen = rangeTransform(0, 0.1, 0, 1, undefTo0(blendshapes['jawOpen']));
      let browInnerUpLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['browInnerUp_L']));
      let browInnerUpRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['browInnerUp_R']));
      let browDownLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['browDown_L']));
      let browDownRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['browDown_R']));
      let eyeWideLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeWide_L']));
      let eyeWideRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeWide_R']));
      let eyeSquintLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeSquint_L']));
      let eyeSquintRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeSquint_R']));
      let mouthFunnel = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthFunnel']));
      let mouthFrownLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthFrown_L']));
      let mouthFrownRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthFrown_R']));
      let mouthSmileLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthSmile_L']));
      let mouthSmileRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthSmile_R']));
      let mouthLowerDownLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthLowerDownLeft']));
      let mouthLowerDownRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthLowerDownRight']));
      let mouthPucker = rangeTransform(0, 1, 0, 0.4, undefTo0(blendshapes['mouthPucker']));
      let eyeLookInLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookIn_L']));
      let eyeLookInRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookIn_R']));
      let eyeLookOutLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookOut_L']));
      let eyeLookOutRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookOut_R']));
      let eyeLookUpLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookUp_L']));
      let eyeLookUpRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookUp_R']));
      let eyeLookDownLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookDown_L']));
      let eyeLookDownRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookDown_R']));

      // TEMP: flip eyes for canvas
      let eyeTmp = eyeBlinkLeft;
      eyeBlinkLeft = eyeBlinkRight;
      eyeBlinkRight = eyeTmp;

      // shorthand
      let coreModel = this.live2dModel.internalModel.coreModel;

      // eye blinking
      const eyeSize = Math.min(eyeBlinkLeft, eyeBlinkRight);
      if (this.modelVersion == 2) {
        this.live2dModel.internalModel.eyeBlink.setEyeParams(eyeSize);
      } else {
        coreModel.setParameterValueById('ParamEyeLOpen', eyeBlinkLeft);
        coreModel.setParameterValueById('ParamEyeROpen', eyeBlinkRight);
      }

      // mouth opening
      if (this.modelVersion == 2) {
        coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', jawOpen);
      } else {
        const mouthOpenY = jawOpen + 0.5 * mouthPucker + 2 * mouthFunnel + 4 * (mouthLowerDownLeft + mouthLowerDownRight);
        coreModel.setParameterValueById('ParamMouthOpenY', mouthOpenY);
      }

      // rotate the head based on orientation estimation
      if (prediction.lookX != undefined && prediction.lookY != undefined) {
        // lookX and lookY injected by action sequence
        // TODO: update action sequence to use head orientation too
        const lookX = this.headXKalmanFilter.filter(prediction.lookX * this.canvas.width / 2 + this.canvas.width / 2);
        const lookY = this.headYKalmanFilter.filter(prediction.lookY * this.canvas.height / 2 + this.canvas.height / 2);
        this.live2dModel.focus(lookX, lookY, true);  // set true to make the motion instant
      } else if (prediction.rotationQuaternion) {
        // apply head orientation from face tracking
        const rotationBlendshapes = faceRotationToBlendshapes(prediction.rotationQuaternion);
        const headYaw = this.headXKalmanFilter.filter(rotationBlendshapes['headYaw']);
        const headPitch = this.headYKalmanFilter.filter(rotationBlendshapes['headPitch']);
        const headRoll = this.headZKalmanFilter.filter(rotationBlendshapes['headRoll']);
        // set head tilting
        if (this.modelVersion == 2) {
          const lookX = -headYaw * 1.5 * this.canvas!.width + this.canvas!.width / 2;
          const lookY = headPitch * 3 * this.canvas!.height + this.canvas!.height / 2;
          this.live2dModel.focus(lookX, lookY, true);  // set true to make the motion instant
          coreModel.addToParamFloat(
            this.angleZParamIndex, -10 * rotationBlendshapes['headRoll']
          );
        } else {
          // https://github.com/guansss/pixi-live2d-display/blob/8ff46e0d304c6ec82eb48fbaf5a207f476880b5e/src/cubism4/Cubism4InternalModel.ts#L216
          coreModel.setParameterValueById('ParamAngleX', HEAD_YAW_MULTIPLIER * headYaw);
          coreModel.setParameterValueById('ParamAngleY', HEAD_PITCH_MULTIPLIER * headPitch);
          coreModel.setParameterValueById('ParamAngleZ', HEAD_ROLL_MULTIPLIER * headRoll);
          coreModel.setParameterValueById('ParamBodyAngleX', BODY_YAW_MULTIPLIER * headYaw);
        }
      }

      if (this.freeMove && prediction.normalizedImagePosition && prediction.normalizedImageScale) {
        this.faceX = 0.5 - (prediction.normalizedImagePosition.x - 0.5) * FACE_MOVE_MULTIPLIER;
        this.faceY = 0.5 - (prediction.normalizedImagePosition.y - 0.5) * FACE_MOVE_MULTIPLIER;
        this.faceFactor = prediction.normalizedImageScale * FACE_DEPTH_MULTIPLIER;
      }

      // advanced facial features for version 4
      if (this.modelVersion == 4) {
        // eye widening
        if (this.eyeWidenable) {
          coreModel.setParameterValueById('ParamEyeLOpen', eyeBlinkLeft + 7 * eyeWideLeft);
          coreModel.setParameterValueById('ParamEyeROpen', eyeBlinkRight + 7 * eyeWideRight);
        }

        // brow reposition
        coreModel.setParameterValueById('ParamBrowLY', browInnerUpLeft - browDownRight);
        coreModel.setParameterValueById('ParamBrowRY', browInnerUpRight - browDownRight);

        // brow rotation
        coreModel.setParameterValueById('ParamBrowLForm', -browDownLeft);
        coreModel.setParameterValueById('ParamBrowRForm', -browDownRight);

        // eye smiling
        coreModel.setParameterValueById('ParamEyeLSmile', eyeSquintLeft);
        coreModel.setParameterValueById('ParamEyeRSmile', eyeSquintRight);

        // mouth pucker (-1) / smile (+1)
        const mouthOShape = (mouthPucker + mouthFunnel) * 1.35;
        let mouthDeform = Math.max(mouthSmileLeft, mouthSmileRight) - Math.max(mouthFrownLeft, mouthFrownRight) - mouthOShape;
        coreModel.setParameterValueById('ParamMouthForm', mouthDeform);

        // iris tracking
        let irisX = (eyeLookInLeft - eyeLookOutLeft + eyeLookOutRight - eyeLookInRight) / 2;
        let irisY = (eyeLookUpLeft - eyeLookDownLeft + eyeLookUpRight - eyeLookDownRight) / 2;
        coreModel.setParameterValueById('ParamEyeBallX', irisX);
        coreModel.setParameterValueById('ParamEyeBallY', irisY);
      }
    }

    // apply expressions if there is any
    if (this.modelVersion == 4) {
      this.applyExpressions();
    }
  }

  // x and y are between 0 and 1
  public lookAt = (x: number, y: number) => {
    if (this.live2dModel && this.canvas) {
      const lookX = this.canvas?.width * x;
      const lookY = this.canvas?.height * y;
      this.live2dModel.focus(lookX, lookY, true);
    }
  }

  public setModelPlacement = (x: number, y: number) => {
    this.modelX = x;
    this.modelY = y;
  };

  public setSizeFactor = (factor: number) => {
    this.sizeFactor = factor;
  };


  public setBackgroundImage = (imageUrl: string) => {
    // If background color exists, disable it
    if (this.backgroundColor) {
      this.backgroundColor = undefined;
    }
    if (!this.backgroundImage) {
      this.backgroundImage = new Image();
      this.backgroundImage.onload = () => {
        this.backgroundImageWidth = this.backgroundImage.width;
        this.backgroundImageHeight = this.backgroundImage.height;
      };
    }
    this.backgroundImageSrc = imageUrl + '?test=123'; // HACK: fixes misleading chrome CORS error
    this.backgroundImage.src = this.backgroundImageSrc;
    this.backgroundImage.crossOrigin = 'anonymous';
  }

  public setBackgroundColor = (colorHexCode: string) => {
    // If background image exists, disable it
    if (this.backgroundImage) {
      this.backgroundImage = undefined;
    }
    this.backgroundColor = colorHexCode;
  }

  public display(
    outCanvas: HTMLCanvasElement,
    outCanvasCtx: CanvasRenderingContext2D
  ) {
    if (this.canvas) {
      // Draw background image
      if (this.backgroundImage && this.backgroundImageSrc) {
        const width = this.backgroundImageWidth;
        const height = this.backgroundImageHeight;
        const ratio = Math.max(
          constants.video.videoWidth / width,
          constants.video.videoHeight / height
        );
        // get the top left position of the image
        const x = (constants.video.videoWidth / 2) - (width / 2) * ratio;
        const y = (constants.video.videoHeight / 2) - (height / 2) * ratio;
        outCanvasCtx.drawImage(this.backgroundImage, x, y, width * ratio, height * ratio);
      } else if (this.backgroundColor) {
        // Draw background color
        outCanvasCtx.fillStyle = this.backgroundColor;
        outCanvasCtx.fillRect(0, 0, constants.video.videoWidth, constants.video.videoHeight);
      } else {
        outCanvasCtx.clearRect(
          0, 0, constants.video.videoWidth, constants.video.videoHeight
        );
      }
      // Draw main avatar
      const scaleX = (this.modelX + this.faceX) / 2;
      const scaleY = (this.modelY + this.faceY) / 2;
      const scaleFactor = (this.sizeFactor + this.faceFactor) / 2;
      outCanvasCtx.drawImage(
        this.canvas,
        constants.video.videoWidth * scaleX - (constants.video.videoWidth * scaleFactor) / 2,
        constants.video.videoHeight * scaleY - (constants.video.videoHeight * scaleFactor) / 2,
        constants.video.videoWidth * scaleFactor,
        constants.video.videoHeight * scaleFactor
      );
    }
  }

  public onWebglContextLost = () => {
    this.app.stage.removeChild(this.live2dModel);
    this.live2dModel.destroy();
    this.live2dModel = null;
    this.app?.destroy();
  }

  public onWebglContextRestored = async () => {
    await new Promise(r => setTimeout(r, RESTORATION_SLEEP_MS));
    // Reinstantiate Pixi application
    const pixiHeight = window.innerHeight;
    const pixiWidth = pixiHeight * PIXI_WINDOW_RATIO;
    this.app = new PIXI.Application({
      view: this.canvas!,
      autoStart: true,
      width: pixiWidth,
      height: pixiHeight,
      backgroundAlpha: 0
    });
    await this.loadFile(this.data);
  }
}
