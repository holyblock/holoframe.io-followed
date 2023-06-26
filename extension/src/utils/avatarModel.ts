export class AvatarModel {
  public modelReady: boolean = false;
  public name: string;
  public canvas: HTMLCanvasElement | null;
  public freeMove: boolean = true;

  // Abstract base class for live2d / 3d models
  constructor(name: string) {
    // set type of the AvatarModel
    this.name = name;
    this.canvas = null;
  }

  public getCanvas() {
    // get the canvas element
    return this.canvas;
  }

  public async loadFile(path: string) {
    // load model from path, can be file path or file url
    console.warn('loadFile in AvatarModel is not implemented.');
  }

  public loadConfig(path: string) {
    // load metadata for our rendering, can be file path or file url
    return;
  }

  public manualRender() {
    // Manually update and render frame for model
    console.warn('manualRender in AvatarModel is not implemented.');
    return;
  }

  public initTextures = (textureNames: string[]) => {
    // init textures for model (only relevant for live2d)
    console.warn('initTextures in AvatarModel is not implemented.');
  }

  public activateTextures = (textureIndices: number[]) => {
    // activate texture for model (only relevant for live2d)
    console.warn('activateTexture in AvatarModel is not implemented.');
  }

  public getActiveTextures = (): number[] | undefined => {
    // get active textures for model (only relevant for live2d)
    console.warn('getActiveTextures in AvatarModel is not implemented.');
    return undefined;
  }

  public initExpressions = (expressions: Map<string, Array<object>>) => {
    // init expression for model (only relevant for live2d)
    console.warn('initExpressions in AvatarModel is not implemented.');
  }

  public activateExpressions = (expNames: string[]) => {
    // activate expression for model (only relevant for live2d)
    console.warn('activateExpressions in AvatarModel is not implemented.');
  };

  public updateFrame(landmarksPredictions: any) {
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

  public display(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D) {
    // display the current frame on canvas
    console.warn('display in AvatarModel is not implemented.');
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

  public init() { }
}
