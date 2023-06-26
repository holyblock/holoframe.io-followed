export class AudioAnalyser {
  private audioCtx: AudioContext;
  private analyser: AnalyserNode;
  private data: Float32Array;
  private sensitivityFactor: number;

  public constructor(sensitivityFactor = 0) {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.data = new Float32Array(this.analyser.fftSize);
    this.sensitivityFactor = sensitivityFactor;
  };

  public connectSource = (audioElement: HTMLAudioElement) => {
    // connect audio source
    this.audioCtx.resume();
    const source = this.audioCtx.createMediaStreamSource(
      (audioElement as any).captureStream());
    source.connect(this.analyser);
  };

  public getVolume = () => {
    if (this.sensitivityFactor === 0) return 0;
    this.analyser.getFloatTimeDomainData(this.data);
    let sumSquares = 0;
    for (const amplitude of this.data) { sumSquares += amplitude * amplitude; }
    const volume = Math.sqrt(sumSquares / this.data.length) * this.sensitivityFactor;
    return volume;
  };

  public updateSensitivityFactor = (sensitivityFactor: number) => {
    this.sensitivityFactor = sensitivityFactor;
  }
}