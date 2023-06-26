import Smoother from './smoother';

export default class HoloBodyModel {
  private inVideo: HTMLVideoElement;

  // mediapipe holistic model instance
  private holistic: any;

  // make sure only running one mediapipe prediction session
  private frameInProcess: boolean;

  // make sure there is one body tracking model being instantiated
  private modelLoaded: boolean = false;

  private animationFrameRequestId: number | null;

  // smoother for raw mediapipe prediction, joint position in screen coordinate
  private poseSmoother: Smoother;

  private leftHandSmoother: Smoother;

  private rightHandSmoother: Smoother;

  public constructor(inVideo: HTMLVideoElement) {
    this.inVideo = inVideo;
    this.frameInProcess = false;
    this.poseSmoother = new Smoother(33, 0.03); // assume 30 FPS
    this.leftHandSmoother = new Smoother(21, 0.03);
    this.rightHandSmoother = new Smoother(21, 0.03);
    if (this.inVideo.readyState === 4 && !this.modelLoaded) {
      // Video already ready, can be because e.g., user enable body tracking
      // after face tracking. In this case, directly enable the body model.
      this.modelLoaded = true;
      this.init();
    } else {
      // Video not ready yet. Add an event listener to enable the body model
      // when the video actually becomes ready.
      inVideo.addEventListener('loadeddata', () => {
        if (!this.modelLoaded) {
          this.modelLoaded = true;
          this.init();
        }
      });
    }
  }

  public init = () => {
    // dynamically load mediapipe model
    const { Holistic } = require('@mediapipe/holistic');
    this.holistic = new Holistic({
      locateFile: (file) => {
        return `https://hologramxyz.s3.amazonaws.com/nn/models/holo-body/${file}`;
      },
    });
    this.holistic.onResults(this.onPredictionResults);
    this.holistic.setOptions({
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.9
    });
    this.startProcess();
  };

  public onPredictionResults = (results: any) => {
    const rightHandLandmark = results.rightHandLandmarks;
    const leftHandLandmark = results.leftHandLandmarks;
    const poseLandmark = results.poseLandmarks;
    this.rightHandSmoother.updateNewPrediction(rightHandLandmark);
    this.leftHandSmoother.updateNewPrediction(leftHandLandmark);
    this.poseSmoother.updateNewPrediction(poseLandmark);
    this.frameInProcess = false;
  };

  public predict = async (videoInput: HTMLVideoElement) => {
    await this.holistic.send({ image: videoInput });
  };

  public processFrame = async () => {
    if (!this.frameInProcess) {
      this.frameInProcess = true;
      await this.predict(this.inVideo);
    }
    this.animationFrameRequestId = requestAnimationFrame(this.processFrame);
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

  public prediction = () => {
    const prediction = {
      rightHandLandmarks:
        this.rightHandSmoother.getCurrentInterpolatedPrediction(),
      leftHandLandmarks:
        this.leftHandSmoother.getCurrentInterpolatedPrediction(),
      poseLandmarks: this.poseSmoother.getCurrentInterpolatedPrediction(),
    };
    return prediction;
  };
}
