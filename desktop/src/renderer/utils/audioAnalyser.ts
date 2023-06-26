export class AudioAnalyser {
  private audioCtx: AudioContext;

  private analyser: AnalyserNode;

  private data: Float32Array;

  private sensitivityFactor: number;

  public initialized: boolean;

  public constructor(sensitivityFactor = 0) {
    this.sensitivityFactor = sensitivityFactor;
    this.initialized = false;
  }

  private init() {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.data = new Float32Array(this.analyser.fftSize);
  }

  public connectSource = (stream: MediaStream) => {
    this.init();
    const source = this.audioCtx.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.initialized = true;
  };

  public getVolume = () => {
    if (this.sensitivityFactor === 0 || !this.analyser) return 0;
    this.analyser.getFloatTimeDomainData(this.data);
    let sumSquares = 0;
    for (const amplitude of this.data) {
      sumSquares += amplitude * amplitude;
    }
    const volume =
      Math.sqrt(sumSquares / this.data.length) * this.sensitivityFactor;
    return volume;
  };

  public updateSensitivityFactor = (sensitivityFactor: number) => {
    this.sensitivityFactor = sensitivityFactor;
  };
}
