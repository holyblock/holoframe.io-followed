const faceLandmarksDetection = require('@tensorflow-models/face-landmarks-detection');
require('@tensorflow/tfjs-backend-webgl');

const PREDICTION_TIME_MAX_MS = 2000;
const PREDICTION_CHECK_INTERVAL_MS = 1000;
const NUM_PREDICTIONS_TO_DECLARE_ACTIVE = 2;

export class TfFaceModel {
  constructor(inVideo) {
    this.inVideo = inVideo;
    this.processing = false;
    this.firstTime = true;
    this.reset();
    inVideo.addEventListener('loadeddata', () => {
      if (this.firstTime) {
        this.init();
        this.firstTime = false;
      }
    });
    this.checkStatus();
  }

  predict = async (videoInput) => {
    let predictions = await this.model.estimateFaces({
      input: videoInput,
      predictIrises: true
    })

    // increment number of predictions made
    this.currentPredIdx += 1;

    // declare model active only after a few model predictions
    if (!this.faceModelActive &&
      this.currentPredIdx >= NUM_PREDICTIONS_TO_DECLARE_ACTIVE) {
      this.faceModelActive = true;
      console.log('---- FACE TRACKING MODEL LOADED ----');
    }

    // mark the latest prediction time within the checking interval
    // Note: use statusChecking to prevent calling new Date() too often
    if (this.faceModelActive && !this.statusChecking) {
      this.statusChecking = true;
      this.prevPredTime = new Date();
    }

    return predictions;
  }

  processFrame = async () => {
    if (this.modelLoaded) {
      this.predictions = await this.predict(this.inVideo);
    }
    this.processTimeout = setTimeout(this.processFrame, 0);
  }

  startProcess = () => {
    if (!this.processing && !this.processTimeout) {
      this.processing = true;
      this.processFrame();
    }
  }

  stopProcess = () => {
    if (this.processing && this.processTimeout) {
      this.processing = false;
      clearTimeout(this.processTimeout);
      this.processTimeout = null;
    }
  }

  checkStatus = () => {
    // Check if tensorflow model returns prediction in a reasonable
    // amount of time. If not, the WebGL backend is likely broken,
    // we should destory the current model and start a new one.
    if (this.faceModelActive) {
      let currTime = new Date();
      if (currTime - this.prevPredTime > PREDICTION_TIME_MAX_MS) {
        console.log('==== tfFaceModel WebGL backend is funky ====');
        this.processing = false;
        if (this.processTimeout) {
          clearTimeout(this.processTimeout);
          this.processTimeout = null;
        }
        this.destory();
        this.reset();
        this.init();
      }
      this.statusChecking = false;
    }
    // schedule for the next checking
    setTimeout(() => { this.checkStatus(); }, PREDICTION_CHECK_INTERVAL_MS);
  }

  destory = () => {
    this.modelLoaded = false;
    if (this.model.layers) {
      this.model.layers.forEach(l => l.dispose());
    }
    this.model = null;
  }

  reset = () => {
    this.modelLoaded = false;
    this.currentPredIdx = 0;
    this.prevPredTime = null;
    this.faceModelActive = false;
    this.statusChecking = false;
  }

  init = async () => {
    console.log('---- LOADING FACE TRACKING MODEL ---- ');
    this.model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      {
        maxFaces: 1,
        shouldLoadIrisModel: true
      });
    this.modelLoaded = true;
    if (!this.processing) {
      this.startProcess();
    }
  }
}
