import {
  ApplicationContext,
  FacemojiAPI,
  FaceTracker,
  ResourceFileSystem,
} from '@hologramlabs/mocap4face';
import config from '../../../../utils/config';

const BLEND_SHAPES_MAP = {
  0: 'browOuterUp_L',
  1: 'browInnerUp_L',
  2: 'browDown_L',
  3: 'eyeBlink_L',
  4: 'eyeSquint_L',
  5: 'eyeWide_L',
  6: 'eyeLookUp_L',
  7: 'eyeLookOut_L',
  8: 'eyeLookIn_L',
  9: 'eyeLookDown_L',
  10: 'noseSneer_L',
  11: 'mouthUpperUp_L',
  12: 'mouthSmile_L',
  13: 'mouthLeft',
  14: 'mouthFrown_L',
  15: 'mouthLowerDown_L',
  16: 'jawLeft',
  17: 'cheekPuff',
  18: 'mouthShrugUpper',
  19: 'mouthFunnel',
  20: 'mouthRollLower',
  21: 'jawOpen',
  22: 'tongueOut',
  23: 'mouthPucker',
  24: 'mouthRollUpper',
  25: 'jawRight',
  26: 'mouthLowerDown_R',
  27: 'mouthFrown_R',
  28: 'mouthRight',
  29: 'mouthSmile_R',
  30: 'mouthUpperUp_R',
  31: 'noseSneer_R',
  32: 'eyeLookDown_R',
  33: 'eyeLookIn_R',
  34: 'eyeLookOut_R',
  35: 'eyeLookUp_R',
  36: 'eyeWide_R',
  37: 'eyeSquint_R',
  38: 'eyeBlink_R',
  39: 'browDown_R',
  40: 'browInnerUp_R',
  41: 'browOuterUp_R',
};

export default class AlterFaceModel {
  private apiKey: string;

  private inVideo: HTMLVideoElement;

  private _prediction: any;

  private animationFrameRequestId: number | null;

  private blendshapeNames: string[] | null;

  private blendShapeMap: any;

  private firstTime: boolean;

  private faceModelActive: boolean;

  private asyncTracker: any;

  public constructor(apiKey: string, inVideo: HTMLVideoElement) {
    this.apiKey = apiKey;
    this.inVideo = inVideo;
    this._prediction = null;
    this.animationFrameRequestId = null;
    this.blendshapeNames = null;
    this.faceModelActive = false;
    this.blendShapeMap = BLEND_SHAPES_MAP;
    // call upon video loaded to avoid passing null to the face model
    this.firstTime = true;
    inVideo.addEventListener('loadeddata', () => {
      if (this.firstTime) {
        this.firstTime = false;
        this.init();
      }
    });
  }

  public init = () => {
    console.log('---- LOADING FACE TRACKING MODEL ---- ');
    const context = new ApplicationContext(config.assets.faceModel);
    const fs = new ResourceFileSystem(context);

    if (this.apiKey) {
      FacemojiAPI.initialize(this.apiKey, context).then((activated) => {
        if (activated) {
          console.log('API activated.');
        } else {
          console.log('API not activated. Check if API key is correct.');
        }
      });

      this.asyncTracker = FaceTracker.createVideoTracker(fs)
        .then((tracker) => {
          console.log('---- FACE TRACKING MODEL LOADED ----');
          this.faceModelActive = true;

          // Collect all blendshape names and prepare UI
          this.blendshapeNames = tracker.blendshapeNames.toArray().sort();

          return tracker;
        })
        .logError('Could not start tracking');

      this.startProcess();
    } else {
      console.error('Face model API Key not found!');
    }
  };

  public predict = (videoInput: HTMLVideoElement) => {
    let prediction = null;
    const tracker = this.asyncTracker?.currentValue;
    if (tracker) {
      prediction = tracker.track(videoInput);
    }
    return prediction;
  };

  public processFrame = () => {
    this._prediction = this.predict(this.inVideo);
    this.animationFrameRequestId = requestAnimationFrame(this.processFrame);
  };

  public startProcess = () => {
    this.faceModelActive = true;
    if (this.animationFrameRequestId == null) {
      this.animationFrameRequestId = requestAnimationFrame(this.processFrame);
    }
  };

  public stopProcess = () => {
    if (this.animationFrameRequestId) {
      this.faceModelActive = false;
      cancelAnimationFrame(this.animationFrameRequestId);
      this.animationFrameRequestId = null;
    }
  };

  public isModelActive = () => {
    return this.faceModelActive;
  };

  public timeoutId = () => {
    return this.animationFrameRequestId;
  };

  public prediction = () => {
    return this._prediction;
  };
}
