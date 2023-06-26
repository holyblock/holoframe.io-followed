import { faceKey } from "../../settings";

// When WebGL context is lost, face tracking will output the same prediction
// consecutively; we assume WebGL is gone after MAX_REPEATED_PREDICTION
// identical predictions
const MAX_REPEATED_PREDICTION = 10;

const BLEND_SHAPES_MAP = {
  0: "browOuterUp_L",
  1: "browInnerUp_L",
  2: "browDown_L",
  3: "eyeBlink_L",
  4: "eyeSquint_L",
  5: "eyeWide_L",
  6: "eyeLookUp_L",
  7: "eyeLookOut_L",
  8: "eyeLookIn_L",
  9: "eyeLookDown_L",
  10: "noseSneer_L",
  11: "mouthUpperUp_L",
  12: "mouthSmile_L",
  13: "mouthLeft",
  14: "mouthFrown_L",
  15: "mouthLowerDown_L",
  16: "jawLeft",
  17: "cheekPuff",
  18: "mouthShrugUpper",
  19: "mouthFunnel",
  20: "mouthRollLower",
  21: "jawOpen",
  22: "tongueOut",
  23: "mouthPucker",
  24: "mouthRollUpper",
  25: "jawRight",
  26: "mouthLowerDown_R",
  27: "mouthFrown_R",
  28: "mouthRight",
  29: "mouthSmile_R",
  30: "mouthUpperUp_R",
  31: "noseSneer_R",
  32: "eyeLookDown_R",
  33: "eyeLookIn_R",
  34: "eyeLookOut_R",
  35: "eyeLookUp_R",
  36: "eyeWide_R",
  37: "eyeSquint_R",
  38: "eyeBlink_R",
  39: "browDown_R",
  40: "browInnerUp_R",
  41: "browOuterUp_R",
};

export default class AlterFaceModel {
  private inVideo: HTMLVideoElement;
  private _prediction: any;
  private animationFrameRequestId: number | null;
  private blendshapeNames: string[] | null;
  private blendShapeMap: any;
  private firstTime: boolean;
  private faceModelActive: boolean;
  private asyncTracker: any;
  private prevPrediction: any;
  private repeatedPredictionCount: number;
  private videoCheckingCanvas: HTMLCanvasElement;
  private videoCheckingCanvasCtx: CanvasRenderingContext2D | null;
  private prevVideoFrameValue: number;
  private nonRepeatedFrameCount: number;

  public constructor(inVideo: HTMLVideoElement) {
    this.inVideo = inVideo;
    this._prediction = null;
    this.animationFrameRequestId = null;
    this.blendshapeNames = null;
    this.faceModelActive = false;
    this.blendShapeMap = BLEND_SHAPES_MAP;
    this.prevPrediction = null;
    this.repeatedPredictionCount = 0;
    this.videoCheckingCanvas = document.createElement("canvas");
    this.videoCheckingCanvasCtx = this.videoCheckingCanvas.getContext("2d");
    this.prevVideoFrameValue = 0;
    this.nonRepeatedFrameCount = 0;
    // call upon video loaded to avoid passing null to the face model
    this.firstTime = true;
    inVideo.addEventListener("loadeddata", () => {
      if (this.firstTime) {
        this.init();
      }
    });
  }

  public init = (reset: boolean = false) => {
    this.firstTime = false;
    this.faceModelActive = false;
    console.log("---- LOADING FACE TRACKING ---- ");

    // reset tensorflow webgl backend if already registered, this is to restore
    // after webgl context lost
    if (reset) {
      console.log("---- RESET FACE TRACKING ---- ");

      // stop ongoing prediction loop
      this.stopProcess();

      // remove existing tensorflow webgl related package from cache
      // Note: we need to remove all cache key, not just tensorflow related ones
      // because minified js will change all the package file names
      Object.keys(require.cache).forEach((key) => {
        delete require.cache[key];
      });

      // remove the current faulty webgl backend
      const tf = require("@tensorflow/tfjs");
      if (tf.getBackend() == "webgl") {
        tf.removeBackend("webgl");
      }
    }
    // load face tracking model from stratch
    const {
      ApplicationContext,
      FacemojiAPI,
      FaceTracker,
      ResourceFileSystem,
    } = require("@hologramlabs/mocap4face");

    const context = new ApplicationContext(
      chrome.runtime.getURL("./assets/nn/")
    );
    const fs = new ResourceFileSystem(context);

    if (faceKey) {
      FacemojiAPI.initialize(faceKey, context).then((activated: boolean) => {
        if (activated) {
          console.log("API activated.");
        } else {
          console.log("API not activated. Check if API key is correct.");
        }
      });

      this.asyncTracker = FaceTracker.createVideoTracker(fs)
        .then((tracker: any) => {
          console.log("---- FACE TRACKING LOADED ----");
          this.faceModelActive = true;

          // Collect all blendshape names and prepare UI
          this.blendshapeNames = tracker.blendshapeNames.toArray().sort();

          // kick off prediction loop
          this.startProcess();

          return tracker;
        })
        .logError("Could not start tracking");
    } else {
      console.error("Face model API Key not found!");
    }
  };

  public restartWebGLIfCrashed = (
    prediction: any,
    videoInput: HTMLVideoElement
  ) => {
    // check if the prediction is legit
    if (prediction) {
      const currPrediction = prediction._normalizedImageScale;
      if (this.prevPrediction == currPrediction) {
        if (this.repeatedPredictionCount >= MAX_REPEATED_PREDICTION) {
          // too many identical predictions, now check if the underlying video
          // is frozen by checking the top left pixel value
          this.videoCheckingCanvas.width = videoInput.videoWidth;
          this.videoCheckingCanvas.height = videoInput.videoHeight;
          this.videoCheckingCanvasCtx?.drawImage(
            videoInput,
            0,
            0,
            videoInput.videoWidth,
            videoInput.videoHeight
          );
          const currVideoFrameValue = this.videoCheckingCanvasCtx?.getImageData(
            0,
            0,
            1,
            1
          ).data[0];
          if (currVideoFrameValue == this.prevVideoFrameValue) {
            // underlying camera is frozen (b/c of e.g., frozen virtual cam)
            // reset the repeated prediction count in this case
            this.repeatedPredictionCount = 0;
          } else {
            this.nonRepeatedFrameCount += 1;
            if (this.nonRepeatedFrameCount >= MAX_REPEATED_PREDICTION) {
              // too many identical predictions even though the video is
              // playing fine, declares WebGL crashes
              this.repeatedPredictionCount = 0;
              // restart the face tracking module
              this.init(true);
            }
          }
          if (currVideoFrameValue) {
            this.prevVideoFrameValue = currVideoFrameValue;
          }
        } else {
          // observed identical prediction
          this.repeatedPredictionCount += 1;
        }
      } else {
        // normal prediction, reset counter
        this.repeatedPredictionCount = 0;
      }
      this.prevPrediction = currPrediction;
    }
  };

  public predict = (videoInput: HTMLVideoElement) => {
    if (this.faceModelActive) {
      const tracker = this.asyncTracker?.currentValue;
      if (tracker) {
        this._prediction = tracker.track(videoInput);
        this.restartWebGLIfCrashed(this._prediction, videoInput);
      }
    }
  };

  public processFrame = () => {
    try {
      this.predict(this.inVideo);
      this.animationFrameRequestId = requestAnimationFrame(this.processFrame);
    } catch (e) {
      // underlying webgl execution engine is down, reset
      this.init(true);
    }
  };

  public startProcess = () => {
    if (this.animationFrameRequestId == null) {
      this.animationFrameRequestId = requestAnimationFrame(this.processFrame);
    }
  };

  public stopProcess = () => {
    if (this.animationFrameRequestId) {
      cancelAnimationFrame(this.animationFrameRequestId);
      this.animationFrameRequestId = null;
    }
  };

  public get isModelActive() {
    return this.faceModelActive;
  }

  public get timeoutId() {
    return this.animationFrameRequestId;
  }

  public get prediction() {
    return this._prediction;
  }

  public get initialized() {
    return !this.firstTime;
  }
}
