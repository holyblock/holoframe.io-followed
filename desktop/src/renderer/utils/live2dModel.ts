import { ShaderSystem } from '@pixi/core';
import { install } from '@pixi/unsafe-eval';
import KalmanFilter from 'kalmanjs';

import * as PIXI from 'pixi.js';

import { ipcRenderer } from 'electron';
import { Placement, Size } from 'renderer/types/types';
import { AvatarModel } from '../types';
import {
  rangeTransform,
  faceRotationToBlendshapes,
  undefTo0,
} from './faceUtils';

require('../../../assets/live2d.min.js');
require('../../../assets/live2dcubismcore.min.js');

// Apply the patch to PIXI to fix unsafe-eval issue for manifest v3
install({ ShaderSystem });
// Need a global PIXI variable in window, because Live2DModel internally
// implements functionality from it, such as window.PIXI.Ticker
// https://github.com/guansss/pixi-live2d-display/blob/master/README.md#basic
(window as any).PIXI = PIXI;
// accordingly, here we should use require() to import the module,
// instead of the import statement because the latter will be hoisted
// over the above assignment when compiling the script
const { Live2DModel } = require('pixi-live2d-display');

const RESTORATION_SLEEP_MS = 3000;
const PIXI_RATIO = 9 / 16;
const EXPRESSION_SPEED = 0.05;
const INITIAL_MODEL_X = 0.5;
const INITIAL_MODEL_Y = 0.5;
const INITIAL_SIZE_FACTOR = 1;
const INITIAL_FACE_X = 0.5;
const INITIAL_FACE_Y = 0.5;
const INITIAL_FACE_FACTOR = 0;
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

  private modelVersion: number = 4;

  private angleZParamIndex: number = 0;

  private eyeWidenable: boolean = false;

  public avatarPlacement: Placement = {
    x: INITIAL_MODEL_X,
    y: INITIAL_MODEL_Y,
  };

  public avatarSize: Size = {
    width: 0,
    height: 0,
    zoomFactor: INITIAL_SIZE_FACTOR,
  };

  private windowResolution: Size = { width: 1280, height: 720 };

  private displayCanvasSize: Size;

  private faceX: number = INITIAL_FACE_X;

  private faceY: number = INITIAL_FACE_Y;

  public faceFactor: number = INITIAL_FACE_FACTOR;

  private headXKalmanFilter: KalmanFilter;

  private headYKalmanFilter: KalmanFilter;

  private headZKalmanFilter: KalmanFilter;

  private lipSyncMouthY: number = 0; // Audio-based lip-sync

  private expressions: Map<string, Array<object>>;

  private activeExpressions: string[];

  private defaultExpressionValues: Map<string, number>;

  private desiredExpressionValues: Map<string, number>;

  private currExpressionValues: Map<string, number>;

  public constructor(
    expressions?: Map<string, Array<object>>,
    zoomFactor?: number,
    previewCanvasSize?: Size, // Size of the responsive preview
    windowResolution?: Size, // Resolution of output video
    config?: any
  ) {
    super('Live2dModel');

    this.displayCanvasSize = previewCanvasSize;
    if (windowResolution) {
      this.windowResolution = windowResolution;
    }
    // Generate canvas
    this.avatarCanvas = document.getElementById(
      'live2d-canvas'
    ) as HTMLCanvasElement;
    if (!this.avatarCanvas) {
      this.avatarCanvas = document.createElement('canvas');
      this.avatarCanvas.setAttribute('id', 'live2d-canvas');
    }

    this.avatarCanvas.addEventListener(
      'webglcontextlost',
      (e) => {
        console.log('==== AvatarModel WebGL context lost ====');
        e.preventDefault();
        this.onWebglContextLost();
      },
      false
    );
    this.avatarCanvas.addEventListener(
      'webglcontextrestored',
      async () => {
        console.log('==== AvatarModel WebGL context restored ====');
        await this.onWebglContextRestored();
      },
      false
    );

    const windowWidth = 1920;
    // create PIXI app that hosts all live2d assets
    this.app = new PIXI.Application({
      view: this.avatarCanvas,
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
    this.expressions = new Map();
    this.initExpressions(expressions);

    // Initialize zoom factor
    if (zoomFactor) {
      this.avatarSize.zoomFactor = zoomFactor;
    }

    // Initialize placement
    if (previewCanvasSize) {
      this.avatarPlacement = {
        x: INITIAL_MODEL_X * previewCanvasSize.width,
        y: INITIAL_MODEL_Y * previewCanvasSize.height,
      };
    }

    if (config) {
      this.loadConfig(config);
    }
  }

  public loadFile = async (data: any) => {
    if (this.loadingModel || !this.avatarCanvas) {
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
      this.avatarCanvas.width / this.live2dModel.width,
      this.avatarCanvas.height / this.live2dModel.height
    );
    this.live2dModel.scale.x = scale;
    this.live2dModel.scale.y = scale;

    // center the model
    this.live2dModel.position.x =
      this.avatarCanvas.width / 2 - this.live2dModel.width / 2;
    this.live2dModel.position.y =
      this.avatarCanvas.height / 2 - this.live2dModel.height / 2;

    // Get and set the avatar width and height
    const canvasScale = Math.min(
      this.displayCanvasSize?.width / this.avatarCanvas.width,
      this.displayCanvasSize?.height / this.avatarCanvas.height
    );
    // absolute pixel value of avatar width and height in outCanvas (determined by live2d model width, external controler's scale factor, model scale factor in pixi display, scale factor when drawing on outCanvas)
    const avatarWidth =
      this.live2dModel.internalModel.width *
      this.live2dModel.scale.x *
      canvasScale;
    const avatarHeight =
      this.live2dModel.internalModel.height *
      this.live2dModel.scale.y *
      canvasScale;
    this.avatarSize = {
      width: avatarWidth,
      height: avatarHeight,
      zoomFactor: this.avatarSize.zoomFactor,
    };

    // attach the model to scene
    this.app.stage.addChild(this.live2dModel);

    // determine model version
    if (this.live2dModel.internalModel.coreModel.getParamIndex) {
      this.modelVersion = 2;
    } else {
      this.modelVersion = 4;
    }

    // pre store parameter indicies
    if (this.modelVersion === 2) {
      this.angleZParamIndex =
        this.live2dModel.internalModel.coreModel.getParamIndex('PARAM_ANGLE_Z');
    }

    // disable v4's default eye blinking
    if (this.modelVersion === 4) {
      this.live2dModel.internalModel.eyeBlink = undefined;
    }

    // check if this model supports eye widening
    if (this.modelVersion === 4) {
      const { coreModel } = this.live2dModel.internalModel; // shorthand
      if (
        coreModel.getParameterMaximumValue(
          coreModel.getParameterIndex('ParamEyeLOpen')
        ) > 1 ||
        coreModel.getParameterMaximumValue(
          coreModel.getParameterIndex('ParamEyeROpen')
        ) > 1
      ) {
        this.eyeWidenable = true;
      }
    }

    // read default expression parameters
    if (this.modelVersion === 4) {
      this.assignExpressionValues();
    }

    // mark finishing of model loading
    this.loadingModel = false;
    console.log('---- LIVE2D MODEL LOADED ---- ');
  };

  // Activate selected expressions
  public activateExpressions = (expNames: string[]) => {
    // Deactivate first, by setting the desired expression value to 0
    const expToDeactivate = this.activeExpressions.filter(
      (exp: string) => !expNames.includes(exp)
    );
    for (const expName of expToDeactivate) {
      const currExp = this.expressions.get(expName);
      for (const exp of currExp!) {
        this.desiredExpressionValues.set(
          expName + exp['Id'],
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

  public initExpressions = (expressions?: Map<string, object[]>) => {
    // Reset expressions
    this.activeExpressions = [] as string[];
    this.defaultExpressionValues = new Map();
    this.desiredExpressionValues = new Map();
    this.currExpressionValues = new Map();
    this.expressions = new Map();

    if (expressions) {
      this.expressions = expressions;
    } else {
      this.expressions = new Map();
    }
    // find default expression values
    this.assignExpressionValues();

    // Keystroke listener to activate/deactivate model special effects
    if (this.expressions) {
      ipcRenderer.send(
        'map-expressions',
        JSON.stringify(Array.from(this.expressions?.keys()))
      );
    }

    ipcRenderer.on('activate-expressions', (evt, message) => {
      // Map key code to corresponding expressions
      const allExps = Array.from(this.expressions.keys()) ?? [];
      const targetExp = allExps[message.expressionIndex];

      // Get new active expressions
      let activeExps: string[] = this.activeExpressions;
      if (targetExp !== undefined && activeExps.includes(targetExp)) {
        activeExps = activeExps.filter((exp: string) => exp !== targetExp);
      } else {
        activeExps = [...activeExps, targetExp];
      }

      // Activate expressions for Live2D
      this.activateExpressions(activeExps);
      document.dispatchEvent(
        new CustomEvent('expression', {
          detail: {
            activeExpressions: activeExps,
          },
        } as any)
      );
    });
  };

  public assignExpressionValues = () => {
    if (this.live2dModel && this.modelVersion === 4) {
      const { coreModel } = this.live2dModel.internalModel; // shorthand
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
  };

  // Helper function for enabling or disabling expressions
  private applyExpressions = () => {
    if (this.activeExpressions.length > 0 && this.live2dModel) {
      const { coreModel } = this.live2dModel.internalModel; // shorthand
      const expToRemove = [];
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
            nextExpValue = Math.min(
              currExpValue + EXPRESSION_SPEED,
              desiredExpValue
            );
          } else if (desiredExpValue < currExpValue) {
            nextExpValue = Math.max(
              currExpValue - EXPRESSION_SPEED,
              desiredExpValue
            );
          }
          coreModel.setParameterValueById(exp['Id'], nextExpValue);
          this.currExpressionValues.set(expKey, nextExpValue);
          if (nextExpValue !== defaultValue) allExpValuesZero = false;
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

  public updateFrame = (facePrediction: any, bodyPrediction: any) => {
    if (
      this.live2dModel &&
      facePrediction &&
      !this.loadingModel &&
      this.avatarCanvas
    ) {
      // convert blendshapes back to dictionary for faster lookup
      const blendshapes = Object.fromEntries(facePrediction.blendshapes);

      let eyeBlinkLeft = rangeTransform(
        0,
        0.5,
        1,
        0,
        undefTo0(blendshapes.eyeBlink_L)
      );
      let eyeBlinkRight = rangeTransform(
        0,
        0.5,
        1,
        0,
        undefTo0(blendshapes.eyeBlink_R)
      );
      const jawOpen = rangeTransform(
        0,
        0.1,
        0,
        1,
        undefTo0(blendshapes.jawOpen)
      );
      const browInnerUpLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.browInnerUp_L)
      );
      const browInnerUpRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.browInnerUp_R)
      );
      const browDownLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes['browDown_L'])
      );
      const browDownRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes['browDown_R'])
      );
      const eyeWideLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeWide_L)
      );
      const eyeWideRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeWide_R)
      );
      const eyeSquintLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeSquint_L)
      );
      const eyeSquintRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeSquint_R)
      );
      const mouthFunnel = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.mouthFunnel)
      );
      const mouthFrownLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes['mouthFrown_L'])
      );
      const mouthFrownRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes['mouthFrown_R'])
      );
      const mouthSmileLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.mouthSmile_L)
      );
      const mouthSmileRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.mouthSmile_R)
      );
      const mouthLowerDownLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.mouthLowerDownLeft)
      );
      const mouthLowerDownRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.mouthLowerDownRight)
      );
      const mouthPucker = rangeTransform(
        0,
        1,
        0,
        0.4,
        undefTo0(blendshapes.mouthPucker)
      );
      const eyeLookInLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeLookIn_L)
      );
      const eyeLookInRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeLookIn_R)
      );
      const eyeLookOutLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeLookOut_L)
      );
      const eyeLookOutRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeLookOut_R)
      );
      const eyeLookUpLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeLookUp_L)
      );
      const eyeLookUpRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeLookUp_R)
      );
      const eyeLookDownLeft = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeLookDown_L)
      );
      const eyeLookDownRight = rangeTransform(
        0,
        1,
        0,
        1,
        undefTo0(blendshapes.eyeLookDown_R)
      );

      // TEMP: flip eyes for canvas
      const eyeTmp = eyeBlinkLeft;
      eyeBlinkLeft = eyeBlinkRight;
      eyeBlinkRight = eyeTmp;

      // shorthand
      const { coreModel } = this.live2dModel.internalModel;

      // eye blinking
      const eyeSize = Math.min(eyeBlinkLeft, eyeBlinkRight);
      if (this.modelVersion === 2) {
        this.live2dModel.internalModel.eyeBlink.setEyeParams(eyeSize);
      } else {
        coreModel.setParameterValueById('ParamEyeLOpen', eyeBlinkLeft);
        coreModel.setParameterValueById('ParamEyeROpen', eyeBlinkRight);
      }

      // mouth opening
      if (this.modelVersion === 2) {
        coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', jawOpen);
      } else {
        const mouthOpenY =
          jawOpen +
          0.5 * mouthPucker +
          2 * mouthFunnel +
          4 * (mouthLowerDownLeft + mouthLowerDownRight);
        coreModel.setParameterValueById(
          'ParamMouthOpenY',
          mouthOpenY + this.lipSyncMouthY
        );
      }

      // rotate the head based on orientation estimation
      const rotationBlendshapes = faceRotationToBlendshapes(
        facePrediction.rotationQuaternion
      );
      const headYaw = this.headXKalmanFilter.filter(
        rotationBlendshapes['headYaw']
      );
      const headPitch = this.headYKalmanFilter.filter(
        rotationBlendshapes['headPitch']
      );
      const headRoll = this.headZKalmanFilter.filter(
        rotationBlendshapes['headRoll']
      );

      // set head tilting
      if (this.modelVersion === 2) {
        const lookX =
          headYaw * 1.5 * this.avatarCanvas!.width +
          this.avatarCanvas!.width / 2;
        const lookY =
          headPitch * 3 * this.avatarCanvas!.height +
          this.avatarCanvas!.height / 2;
        this.live2dModel.focus(lookX, lookY, true); // set true to make the motion instant
        coreModel.addToParamFloat(
          this.angleZParamIndex,
          -100 * rotationBlendshapes['headRoll']
        );
      } else {
        // https://github.com/guansss/pixi-live2d-display/blob/8ff46e0d304c6ec82eb48fbaf5a207f476880b5e/src/cubism4/Cubism4InternalModel.ts#L216
        coreModel.setParameterValueById(
          'ParamAngleX',
          HEAD_YAW_MULTIPLIER * headYaw
        );
        coreModel.setParameterValueById(
          'ParamAngleY',
          HEAD_PITCH_MULTIPLIER * headPitch
        );
        coreModel.setParameterValueById(
          'ParamAngleZ',
          HEAD_ROLL_MULTIPLIER * headRoll
        );
        coreModel.setParameterValueById(
          'ParamBodyAngleX',
          BODY_YAW_MULTIPLIER * headYaw
        );
      }

      if (this.freeMove) {
        this.faceX =
          0.5 -
          (facePrediction.normalizedImagePosition.x - 0.5) *
            FACE_MOVE_MULTIPLIER;
        this.faceY =
          0.5 -
          (facePrediction.normalizedImagePosition.y - 0.5) *
            FACE_MOVE_MULTIPLIER;
        this.faceFactor =
          facePrediction.normalizedImageScale * FACE_DEPTH_MULTIPLIER - 1;
      }

      // advanced facial features for version 4
      if (this.modelVersion === 4) {
        // eye widening
        if (this.eyeWidenable) {
          coreModel.setParameterValueById(
            'ParamEyeLOpen',
            eyeBlinkLeft + 7 * eyeWideLeft
          );
          coreModel.setParameterValueById(
            'ParamEyeROpen',
            eyeBlinkRight + 7 * eyeWideRight
          );
        }

        // brow reposition
        coreModel.setParameterValueById(
          'ParamBrowLY',
          browInnerUpLeft - browDownRight
        );
        coreModel.setParameterValueById(
          'ParamBrowRY',
          browInnerUpRight - browDownRight
        );

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
        const irisX =
          (eyeLookInLeft - eyeLookOutLeft + eyeLookOutRight - eyeLookInRight) /
          2;
        const irisY =
          (eyeLookUpLeft -
            eyeLookDownLeft +
            eyeLookUpRight -
            eyeLookDownRight) /
          2;
        coreModel.setParameterValueById('ParamEyeBallX', irisX);
        coreModel.setParameterValueById('ParamEyeBallY', irisY);
      }
    }

    // apply expressions if there is any
    if (this.modelVersion === 4) {
      this.applyExpressions();
    }
  };

  // x and y are between 0 and 1
  public lookAt = (x: number, y: number) => {
    if (this.live2dModel && this.avatarCanvas) {
      const lookX = this.avatarCanvas?.width * x;
      const lookY = this.avatarCanvas?.height * y;
      this.live2dModel.focus(lookX, lookY, true);
    }
  };

  // Configure audio-based lip-sync
  public updateLipSync(volume: number): void {
    this.lipSyncMouthY = volume;
  }

  public setModelPlacement = (x: number, y: number) => {
    this.avatarPlacement = {
      x,
      y,
    };
  };

  public setSizeFactor = (factor: number) => {
    this.avatarSize.zoomFactor = factor;
  };

  public display(
    canvasSize: Size,
    outCanvasCtx: CanvasRenderingContext2D
  ): any {
    if (this.avatarCanvas) {
      this.displayCanvasSize = canvasSize;
      // Draw main avatar
      // avatar scale is determined by size controller and face distance
      const scaleFactor = this.avatarSize.zoomFactor + this.faceFactor;
      const canvasScale = Math.min(
        canvasSize.width / this.avatarCanvas.width,
        canvasSize.height / this.avatarCanvas.height
      );

      // Update externally accessible avatarSize values
      this.avatarSize.width =
        this.live2dModel.internalModel.width *
        this.live2dModel.scale.x *
        canvasScale;
      this.avatarSize.height =
        this.live2dModel.internalModel.height *
        this.live2dModel.scale.y *
        canvasScale;

      // absolute pixel value of avatar width (determined by live2d model width, external controler's scale factor, model scale factor in pixi display, scale factor when drawing on outCanvas)
      const dynamicAvatarWidth =
        this.live2dModel.internalModel.width *
        scaleFactor *
        this.live2dModel.scale.x *
        canvasScale;
      // absolute pixel value of avatar height (determined by live2d model height, external controler's scale factor, model scale factor in pixi display, scale factor when drawing on outCanvas)
      const dynamicAvatarHeight =
        this.live2dModel.internalModel.height *
        scaleFactor *
        this.live2dModel.scale.y *
        canvasScale;

      // relative model center's x to the outCanvas
      const centerModelXRelative = this.avatarPlacement.x / canvasSize.width;
      // relative model center's y to the outCanvas
      const centerModelYRelative = this.avatarPlacement.y / canvasSize.height;
      // relative display x to the outCanvas (face location on top of original model)
      const scaleX = centerModelXRelative + this.faceX - 0.5;
      // relative display y to the outCanvas (face location on top of original model)
      const scaleY = centerModelYRelative + this.faceY - 0.5;

      // Offsets to live2d model centering
      const outCanvasDisplayXOffset =
        (this.live2dModel.position.x / this.avatarCanvas.width) *
        canvasSize.width *
        scaleFactor;
      const outCanvasDisplayYOffset =
        (this.live2dModel.position.y / this.avatarCanvas.height) *
        canvasSize.height *
        scaleFactor;
      // top left corner absolute pixel location X to display on the outCanvas
      const outCanvasDisplayX =
        canvasSize.width * scaleX -
        dynamicAvatarWidth / 2 -
        outCanvasDisplayXOffset;
      // top left corner absolute pixel location Y to display on the outCanvas
      const outCanvasDisplayY =
        canvasSize.height * scaleY -
        dynamicAvatarHeight / 2 -
        outCanvasDisplayYOffset;

      outCanvasCtx.drawImage(
        this.avatarCanvas,
        (outCanvasDisplayX * this.windowResolution.width) / canvasSize.width,
        (outCanvasDisplayY * this.windowResolution.height) / canvasSize.height,
        this.windowResolution.width * scaleFactor,
        this.windowResolution.height * scaleFactor
      );
    }
  }

  public onWebglContextLost = () => {
    this.app.stage.removeChild(this.live2dModel);
    this.live2dModel.destroy();
    this.live2dModel = null;
    this.app?.destroy();
  };

  public onWebglContextRestored = async () => {
    await new Promise((resolve) => setTimeout(resolve, RESTORATION_SLEEP_MS));
    // Reinstantiate Pixi application
    const windowWidth = Math.min(window.innerWidth, 1920);

    this.app = new PIXI.Application({
      view: this.avatarCanvas!,
      autoStart: true,
      width: windowWidth,
      height: Math.round(windowWidth * PIXI_RATIO),
      backgroundAlpha: 0,
    });
    await this.loadFile(this.data);
  };
}
