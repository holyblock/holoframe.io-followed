import './live2dcubismcore.min.js';  // v4
import './live2d.min.js';  // v2
import KalmanFilter from 'kalmanjs';

import { ShaderSystem } from '@pixi/core';
import { install } from '@pixi/unsafe-eval';

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

import { AvatarModel } from './avatarModel';
import {
  checkUnflipped,
  faceRotationToBlendshapes,
  rangeTransform,
  undefTo0,
} from './faceUtils';

const RESTORATION_SLEEP_MS = 3000;
const PIXI_RATIO = 9 / 16;
const EXPRESSION_SPEED = 0.05;
const SIZE_MULTIPLIER = 1.2;
const INITIAL_MODEL_X = 0.5;
const INITIAL_MODEL_Y = 0.5;
const INITIAL_SIZE_FACTOR = 1;
const INITIAL_FACE_X = 0.5;
const INITIAL_FACE_Y = 0.5;
const INITIAL_FACE_FACTOR = 1;
const FACE_MOVE_MULTIPLIER = 0.65;
const FACE_DEPTH_MULTIPLIER = 4;
const HEAD_YAW_MULTIPLIER = 200;
const HEAD_PITCH_MULTIPLIER = -400;
const HEAD_ROLL_MULTIPLIER = -200;
const BODY_YAW_MULTIPLIER = 30;

export default class Live2dModel extends AvatarModel {
  private app: PIXI.Application;
  private loadingModel: boolean;
  private live2dModel: any;
  private data: any;
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
  private lipSyncMouthY: number = 0;
  private expressions?: Map<string, Array<object>>;
  private activeExpressions: string[];
  private defaultExpressionValues: Map<string, number>;
  private desiredExpressionValues: Map<string, number>;
  private currExpressionValues: Map<string, number>;
  private textureNames?: string[];
  private activeTextureIndices?: number[];
  private then: number | undefined; // For manual rendering

  public constructor(
    expressions?: Map<string, Array<object>>
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

    // create PIXI app that hosts all live2d assets
    const windowWidth = Math.min(window.innerWidth, 1920);
    this.app = new PIXI.Application({
      view: this.canvas,
      autoStart: true,
      width: windowWidth,
      height: Math.round(windowWidth * PIXI_RATIO),
      backgroundAlpha: 0,
    });

    // locking to make sure we don't load two models at the same time
    this.loadingModel = false;

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
  };

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
      this.canvas.height / this.live2dModel.height) * 0.6;
    this.live2dModel.scale.x = scale;
    this.live2dModel.scale.y = scale;

    // center the model
    this.live2dModel.position.x =
      (this.canvas.width - this.live2dModel.width) * 0.5;
    this.live2dModel.position.y =
      (this.canvas.height - this.live2dModel.height) * 0.6;

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
    this.modelReady = true;
    console.log('---- LIVE2D MODEL LOADED ---- ');
  };

  public manualRender = () => {
    if (!this.then) {
      this.then = performance.now();
    }
    const now = performance.now();
    this.live2dModel?.update(now - this.then);
    this.then = now;
    this.app.render();
  };

  public initTextures = (textureNames: string[]) => {
    this.textureNames = textureNames;
    this.activeTextureIndices = [...Array(textureNames.length).keys()];
  };

  public activateTextures = (textureIndices: number[]) => {
    this.activeTextureIndices = textureIndices;
  };

  public getActiveTextures = (): number[] | undefined => {
    return this.activeTextureIndices;
  }

  public initExpressions = (expressions: Map<string, object[]> | undefined) => {
    if (expressions) {
      this.expressions = expressions;
    } else {
      this.expressions = new Map();
    }
    // find default expression values
    this.assignExpressionValues();
  };

  public assignExpressionValues = () => {
    if (this.expressions) {
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
  }

  // Activate selected expressions
  public activateExpressions = (expNames: string[]) => {
    // Deactivate first, by setting the desired expression value to 0
    const expToDeactivate = this.activeExpressions.filter(
      (exp: string) => !expNames.includes(exp)
    );
    for (const expName of expToDeactivate) {
      const currExp = this.expressions!.get(expName);
      for (const exp of currExp!) {
        this.desiredExpressionValues.set(expName + exp['Id'],
          this.defaultExpressionValues.get(expName + exp['Id'])!
        );
      }
    }
    // Add new expressions to active list
    const expToAdd = expNames.filter(
      (exp: string) => !this.activeExpressions.includes(exp)
    );
    for (const expName of expToAdd) {
      const currExp = this.expressions!.get(expName);
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
      let expToRemove: string[] = [];
      for (const expName of this.activeExpressions) {
        const currExp = this.expressions!.get(expName);
        let allExpValuesZero = true;
        for (const exp of currExp!) {
          const expKey = expName + exp['Id'];
          const currExpValue = this.currExpressionValues.get(expKey);
          const desiredExpValue = this.desiredExpressionValues.get(expKey);
          const defaultValue = this.defaultExpressionValues.get(expKey);
          if (currExpValue !== undefined && desiredExpValue !== undefined) {
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

      // flip eyes if canvas is flipped
      if (checkUnflipped()) {
        let eyeTmp = eyeBlinkLeft;
        eyeBlinkLeft = eyeBlinkRight;
        eyeBlinkRight = eyeTmp;
      }

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
        coreModel.setParameterValueById('ParamMouthOpenY', mouthOpenY + this.lipSyncMouthY);
      }

      // rotate the head based on orientation estimation
      const rotationBlendshapes = faceRotationToBlendshapes(prediction.rotationQuaternion);
      const headYaw = this.headXKalmanFilter.filter(rotationBlendshapes['headYaw']);
      const headPitch = this.headYKalmanFilter.filter(rotationBlendshapes['headPitch']);
      const headRoll = this.headZKalmanFilter.filter(rotationBlendshapes['headRoll']);

      // set head tilting
      if (this.modelVersion == 2) {
        const lookX = headYaw * 1.5 * this.canvas!.width + this.canvas!.width / 2;
        const lookY = headPitch * 3 * this.canvas!.height + this.canvas!.height / 2;
        this.live2dModel.focus(lookX, lookY, true);  // set true to make the motion instant
        coreModel.addToParamFloat(
          this.angleZParamIndex, -100 * rotationBlendshapes['headRoll']
        );
      } else {
        // https://github.com/guansss/pixi-live2d-display/blob/8ff46e0d304c6ec82eb48fbaf5a207f476880b5e/src/cubism4/Cubism4InternalModel.ts#L216
        coreModel.setParameterValueById('ParamAngleX', HEAD_YAW_MULTIPLIER * headYaw);
        coreModel.setParameterValueById('ParamAngleY', HEAD_PITCH_MULTIPLIER * headPitch);
        coreModel.setParameterValueById('ParamAngleZ', HEAD_ROLL_MULTIPLIER * headRoll);
        coreModel.setParameterValueById('ParamBodyAngleX', BODY_YAW_MULTIPLIER * headYaw);
      }

      if (this.freeMove) {
        this.faceX = 0.5 - (prediction.normalizedImagePosition.x - 0.5) * FACE_MOVE_MULTIPLIER;
        this.faceY = 0.5 - (prediction.normalizedImagePosition.y - 0.5) * FACE_MOVE_MULTIPLIER;
        this.faceFactor = 1 + prediction.normalizedImageScale * FACE_DEPTH_MULTIPLIER;
      }

      // advanced facial features for version 4
      if (this.modelVersion == 4) {
        // eye widening
        if (this.eyeWidenable) {
          coreModel.setParameterValueById('ParamEyeLOpen', eyeBlinkLeft + 7 * eyeWideLeft);
          coreModel.setParameterValueById('ParamEyeROpen', eyeBlinkRight + 7 * eyeWideRight);
        }

        // brow reposition
        coreModel.setParameterValueById('ParamBrowLY', browInnerUpLeft - browDownLeft);
        coreModel.setParameterValueById('ParamBrowRY', browInnerUpRight - browDownRight);

        // brow rotation
        coreModel.setParameterValueById('ParamBrowLForm', -browDownLeft);
        coreModel.setParameterValueById('ParamBrowRForm', -browDownRight);

        // eye smiling
        coreModel.setParameterValueById('ParamEyeLSmile', eyeSquintLeft);
        coreModel.setParameterValueById('ParamEyeRSmile', eyeSquintRight);

        // mouth pucker (-1) / smile (+1)
        const mouthOShape = (mouthPucker + mouthFunnel) * 1.35;
        const mouthDeform =
          Math.max(mouthSmileLeft, mouthSmileRight) -
          Math.max(mouthFrownLeft, mouthFrownRight) -
          mouthOShape;
        coreModel.setParameterValueById('ParamMouthForm', mouthDeform);

        // iris tracking
        let irisX = (eyeLookInLeft - eyeLookOutLeft + eyeLookOutRight - eyeLookInRight) / 2;
        let irisY = (eyeLookUpLeft - eyeLookDownLeft + eyeLookUpRight - eyeLookDownRight) / 2;
        coreModel.setParameterValueById('ParamEyeBallX', irisX);
        coreModel.setParameterValueById('ParamEyeBallY', irisY);
      }

      // apply expressions if there is any
      if (this.modelVersion == 4) {
        this.applyExpressions();
      }
    }
  };

  public updateLipSync = (volume: number) => {
    this.lipSyncMouthY = volume;
  };

  public setModelPlacement = (x: number, y: number) => {
    this.modelX = x;
    this.modelY = y;
  };

  public setSizeFactor = (factor: number) => {
    this.sizeFactor = factor * SIZE_MULTIPLIER;
  };

  public display(
    outCanvas: HTMLCanvasElement,
    outCanvasCtx: CanvasRenderingContext2D
  ) {
    if (this.canvas) {
      // Draw main avatar
      const scaleX = (this.modelX + this.faceX) / 2;
      const scaleY = (this.modelY + this.faceY) / 2;
      const scaleFactor = (this.sizeFactor + this.faceFactor) / 2;
      // the following coordinates and size are absolute numbers on outCanvas
      const modelCenterX = outCanvas.width * scaleX;
      const modelCenterY = outCanvas.height * scaleY;
      const modelWidth = outCanvas.width * scaleFactor;
      const modelHeight = outCanvas.height * scaleFactor;
      outCanvasCtx.drawImage(
        this.canvas,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
        modelCenterX - modelWidth / 2,
        modelCenterY - modelHeight / 2,
        modelWidth,
        modelHeight
      );
    }
  };

  public onWebglContextLost = () => {
    this.app.stage.removeChild(this.live2dModel);
    this.live2dModel.destroy();
    this.live2dModel = null;
    this.app?.destroy();
  };

  public onWebglContextRestored = async () => {
    await new Promise(r => setTimeout(r, RESTORATION_SLEEP_MS));
    // Reinstantiate Pixi application
    const windowWidth = Math.min(window.innerWidth, 1920);
    this.app = new PIXI.Application({
      view: this.canvas!,
      autoStart: true,
      width: windowWidth,
      height: Math.round(windowWidth * PIXI_RATIO),
      backgroundAlpha: 0
    });
    await this.loadFile(this.data);
  };

  public getExpressionNames = () => {
    return Array.from(this.expressions?.keys() ?? []);
  };

  public getActiveExpressionNames = () => {
    return this.activeExpressions;
  };
}
