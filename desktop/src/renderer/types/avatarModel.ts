import { Placement, Size } from './types';

export class AvatarModel {
  public modelReady: boolean = false;

  name: string;

  avatarCanvas: HTMLCanvasElement | null;

  public freeMove: boolean = true;

  public avatarPlacement: Placement;

  public avatarSize: Size;

  public faceFactor: number;

  constructor(name: string) {
    this.name = name;
    this.avatarCanvas = null;
  }

  public getCanvas() {
    // get the canvas element
    return this.avatarCanvas;
  }

  public async loadFile(path: string) {
    // load model from path, can be file path or file url
    console.warn('loadFile in AvatarModel is not implemented.');
  }

  public loadConfig(path: string) {
    // load metadata for our rendering, can be file path or file url
  }

  public initExpressions = (expressions: Map<string, Array<object>>) => {
    // init expression for model (only relevant for live2d)
    console.warn('initExpressions in AvatarModel is not implemented.');
  };

  public activateExpressions = (expNames: string[]) => {
    // set expression for model (only relevant for live2d)
    console.warn('setExpressions in AvatarModel is not implemented.');
  };

  public updateFrame(facePredictions: any, bodyPredictions: any) {
    // update / animate model in canvas from landmarkPredictions
    console.warn('updateFrame in AvatarModel is not implemented.');
  }

  public updateLipSync(volume: number) {
    // update the audio volume from audio source (e.g., for lip sync)
    console.warn('updateLipSync in AvatarModel is not implemented.');
  }

  public lookAt(x: number, y: number, z?: number) {
    // update / animate model in canvas from mouse position
    console.warn('lookAt in AvatarModel is not implemented.');
  }

  public display(canvasSize: Size, canvasCtx: CanvasRenderingContext2D) {
    // display the current frame on canvas
    console.warn('display in AvatarModel is not implemented.');
  }

  public resetCamera() {
    // display the current frame on canvas
    console.warn('resetCamera in AvatarModel is not implemented.');
  }

  public setModelPlacement(x: number, y: number) {
    // set the model placement on canvas
    console.warn('setModelPlacement in AvatarModel is not implemented.');
  }

  public setSizeFactor(factor: number) {
    // set the model size factor on canvas
    console.warn('setSizeFactor in AvatarModel is not implemented.');
  }

  public setFreeMove(freeMove: boolean) {
    this.freeMove = freeMove;
  }

  public onWebglContextLost() {
    // handle WebGL context lost
    console.warn('onWebglContextLost in AvatarModel is not implemented.');
  }

  public async onWebglContextRestored() {
    // handle WebGL context restoration
    console.warn('onWebglContextRestored in AvatarModel is not implemented.');
  }

  public init() {}
}
