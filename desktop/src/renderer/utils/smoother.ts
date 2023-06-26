const getSmoothedValue = (
  startValue: number,
  startTime: number,
  endValue: number,
  endTime: number,
  currTime: number
) => {
  // linearly interpolate the value
  return (
    endValue +
    ((currTime - endTime) / (endTime - startTime)) * (endValue - startValue)
  );
};

export default class Smoother {
  private predictionCount: number;

  private intervalEstimate: number;

  private startTime: number;

  private endTime: number;

  private currTime: number;

  private startPrediction: Array<any>;

  private endPrediction: Array<any>;

  private currPrediction: Array<any>;

  private intervalSum: number;

  private intervalCount: number;

  private averageInterval: number;

  private predictionReady: boolean;

  public constructor(predictionCount: number, intervalEstimate: number) {
    this.predictionCount = predictionCount;
    this.intervalEstimate = intervalEstimate;
    this.init();
  }

  public init = () => {
    const d = new Date();
    this.currTime = d.getTime();
    this.endTime = this.currTime;
    this.startTime = this.endTime - this.intervalEstimate;
    this.intervalSum = this.intervalEstimate;
    this.intervalCount = 1;
    this.averageInterval = this.intervalSum / this.intervalCount;
    this.startPrediction = new Array(this.predictionCount);
    this.endPrediction = new Array(this.predictionCount);
    this.currPrediction = new Array(this.predictionCount);
    for (let i = 0; i < this.predictionCount; i++) {
      this.startPrediction[i] = { x: 0, y: 0, z: 0 };
      this.endPrediction[i] = { x: 0, y: 0, z: 0 };
      this.currPrediction[i] = { x: 0, y: 0, z: 0 };
    }
    this.predictionReady = false;
  };

  public updateNewPrediction = (prediction: any) => {
    if (prediction) {
      const d = new Date();
      // make the previous current timestamp and value as start
      this.startTime = this.currTime;
      for (let i = 0; i < this.startPrediction.length; i++) {
        this.startPrediction[i].x = this.currPrediction[i].x;
        this.startPrediction[i].y = this.currPrediction[i].y;
        this.startPrediction[i].z = this.currPrediction[i].z;
      }
      // make the current wall time and prediction as the end
      this.endTime = d.getTime();
      for (let i = 0; i < this.endPrediction.length; i++) {
        this.endPrediction[i].x = prediction[i].x;
        this.endPrediction[i].y = prediction[i].y;
        this.endPrediction[i].z = prediction[i].z;
      }
      // update the average interval
      this.intervalSum += this.endTime - this.startTime;
      this.intervalCount += 1;
      this.averageInterval = this.intervalSum / this.intervalCount;
      // mark prediction result ready to use
      this.predictionReady = true;
    } else {
      // null prediction, body / hand outside the scene, reset smoother
      this.init();
    }
  };

  public getCurrentInterpolatedPrediction = () => {
    if (this.predictionReady) {
      // the "current" time lags behind so it can get the interpolation
      const d = new Date();
      const currTime = d.getTime() - this.averageInterval;
      for (let i = 0; i < this.currPrediction.length; i++) {
        this.currPrediction[i].x = getSmoothedValue(
          this.startPrediction[i].x,
          this.startTime,
          this.endPrediction[i].x,
          this.endTime,
          currTime
        );
        this.currPrediction[i].y = getSmoothedValue(
          this.startPrediction[i].y,
          this.startTime,
          this.endPrediction[i].y,
          this.endTime,
          currTime
        );
        this.currPrediction[i].z = getSmoothedValue(
          this.startPrediction[i].z,
          this.startTime,
          this.endPrediction[i].z,
          this.endTime,
          currTime
        );
      }
      return this.currPrediction;
    }
    return null;
  };
}
