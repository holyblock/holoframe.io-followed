import { PeaksInstance } from 'peaks.js';
import { Placement } from 'renderer/types';
import { Size, SceneType, isCanvasText } from 'renderer/types/types';
import config from '../../../../utils/config';
import { SceneItemType } from '../../../../utils/types/index';
import CanvasText from './canvasText';

export class Scene {
  private audioContext: AudioContext;

  private items: SceneItemType[];

  private mp3Items: HTMLAudioElement[];

  private mp3SourceNodeItems: MediaElementAudioSourceNode[];

  private peaksInstances: PeaksInstance[];

  private itemPlacements: Map<string, Placement>; // { imgUrl: Placement }

  private itemSizes: Map<string, Size>;

  private defaultBackgroundImage: HTMLImageElement;

  private backgroundImage: HTMLImageElement;

  private backgroundColor: string;

  private previewCanvasSize: Size;

  private videoBackgroundMode: boolean;

  private windowResolution: Size = { width: 1280, height: 720 };

  // Abstract base class for renderinng items (pngs, videos, windows)
  constructor(windowResolution?: Size) {
    this.audioContext = new AudioContext();
    this.items = [];
    this.mp3Items = [];
    this.mp3SourceNodeItems = [];
    this.peaksInstances = [];
    this.backgroundColor = '';
    if (windowResolution) {
      this.previewCanvasSize = windowResolution;
    }

    const defaultBgImage = new Image();
    defaultBgImage.crossOrigin = 'anonymous';
    defaultBgImage.src = config.assets.defaultBackgroundDark;
    this.defaultBackgroundImage = defaultBgImage;
    this.backgroundImage = defaultBgImage;

    this.itemPlacements = new Map();
    this.itemSizes = new Map();
    this.previewCanvasSize = { width: 0, height: 0, zoomFactor: 1 };

    this.videoBackgroundMode = false;
  }

  public getItems() {
    return this.items;
  }

  public getAudioContext() {
    return this.audioContext;
  }

  public getMp3Items() {
    return this.mp3Items;
  }

  public getMp3SourceNodeItems() {
    return this.mp3SourceNodeItems;
  }

  public getPeaksInstances() {
    return this.peaksInstances;
  }

  public getPlacement(imageUrl: string) {
    return this.itemPlacements.get(imageUrl);
  }

  public setPlacement(imageUrl: string, placement: Placement) {
    this.itemPlacements.set(imageUrl, placement);
  }

  public getSize(imageUrl: string) {
    return this.itemSizes.get(imageUrl);
  }

  public setSize(imageUrl: string, size: Size) {
    this.itemSizes.set(imageUrl, size);
  }

  public setVideoBackgroundMode(mode: boolean) {
    this.videoBackgroundMode = mode;
  }

  public async addItem(item: string, type: SceneType) {
    return new Promise((resolve, reject) => {
      if (type === SceneType.image) {
        const newImg = new Image();
        newImg.src = item;
        newImg.crossOrigin = 'anonymous';
        newImg.onload = () => {
          this.items.push(newImg);
          this.itemPlacements.set(item, {
            x: 0,
            y: 0,
          });

          const { width, height } = newImg;
          const canvasScale = Math.min(
            this.previewCanvasSize.width / width,
            this.previewCanvasSize.height / height
          );
          this.itemSizes.set(item, {
            width,
            height,
            zoomFactor: canvasScale / 2,
            defaultZoomFactor: canvasScale / 2,
          });
          resolve(null);
        };
      } else if (type === SceneType.video) {
        const newVid = document.createElement('video');
        newVid.src = item;
        newVid.loop = true;
        newVid.onloadedmetadata = () => newVid.play();
        newVid.onplay = () => {
          this.items.push(newVid);
          this.itemPlacements.set(item, {
            x: 0,
            y: 0,
          });
          const { videoWidth, videoHeight } = newVid;
          const canvasScale = Math.max(
            this.previewCanvasSize.width / videoWidth,
            this.previewCanvasSize.height / videoHeight
          );
          this.itemSizes.set(item, {
            width: videoWidth,
            height: videoHeight,
            zoomFactor: canvasScale / 2,
            defaultZoomFactor: canvasScale / 2,
          });
          resolve(null);
        };
      } else if (type === SceneType.window) {
        (navigator.mediaDevices as any)
          .getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: item,
              },
            },
          })
          .then((stream) => {
            const newVid = document.createElement('video');
            newVid.src = item;
            newVid.srcObject = stream;
            newVid.onloadedmetadata = () => newVid.play();
            newVid.onplay = () => {
              this.items.push(newVid);
              this.itemPlacements.set(item, {
                x: 0,
                y: 0,
              });
              const { width } = stream.getVideoTracks()[0].getSettings();
              const { height } = stream.getVideoTracks()[0].getSettings();
              const canvasScale = Math.max(
                this.previewCanvasSize.width / width,
                this.previewCanvasSize.height / height
              );
              this.itemSizes.set(item, {
                width,
                height,
                zoomFactor: canvasScale / 2,
                defaultZoomFactor: canvasScale / 2,
              });
              resolve(null);
            };
          });
      } else if (type === SceneType.text) {
        const canvasText = new CanvasText(item);
        this.items.push(canvasText);
        this.itemPlacements.set(canvasText.getId(), {
          x: this.previewCanvasSize.width / 2,
          y: this.previewCanvasSize.height / 2,
        });
        const { width, height } = canvasText.getSize();

        const canvasScale = Math.min(
          this.previewCanvasSize.width / width,
          this.previewCanvasSize.height / height
        );
        this.itemSizes.set(canvasText.getId(), {
          width,
          height,
          zoomFactor: canvasScale / 2,
          defaultZoomFactor: canvasScale / 2,
        });
        resolve(null);
      }
    });
  }

  public removeItem(imageUrl: string) {
    this.items = this.items.filter(
      (item) => (isCanvasText(item) ? item.getId() : item.src) !== imageUrl
    );

    this.itemPlacements.delete(imageUrl);
    this.itemSizes.delete(imageUrl);
  }

  public moveToTop(itemId: string) {
    const index = this.items.findIndex(
      (item) => (isCanvasText(item) ? item.getId() : item.src) === itemId
    );
    this.items = [
      ...this.items.filter((_, i) => i !== index),
      this.items[index],
    ];
  }

  public moveToBottom(itemId: string) {
    const index = this.items.findIndex(
      (item) => (isCanvasText(item) ? item.getId() : item.src) === itemId
    );
    this.items = [
      this.items[index],
      ...this.items.filter((_, i) => i !== index),
    ];
  }

  public clearItems() {
    this.items = [];
  }

  public hasItems() {
    return this.items.length > 0 || this.backgroundColor !== '';
  }

  public async addMp3Item(data: string) {
    if (this.mp3Items.length < 3) {
      return new Promise((resolve, reject) => {
        const newAud = document.createElement('audio');
        newAud.src = data;
        newAud.loop = true;
        newAud.onloadedmetadata = () => {
          this.mp3Items.push(newAud);
          this.mp3SourceNodeItems.push(
            this.audioContext.createMediaElementSource(newAud)
          );
          resolve(null);
        };
      });
    }
  }

  public addPeaksInstance(p: PeaksInstance) {
    this.peaksInstances.push(p);
  }

  public removePeaksInstances() {
    this.peaksInstances = [];
  }

  public removeMp3Item(index: number) {
    this.mp3Items.splice(index, 1);
    this.mp3SourceNodeItems.splice(index, 1);
  }

  public removeMp3Items() {
    this.mp3Items.forEach((mp3) => mp3.pause());
    this.mp3Items = [];
    this.mp3SourceNodeItems = [];
  }

  public setBackgroundImage(imageUrl: string) {
    if (this.backgroundColor) this.backgroundColor = '';
    let background;
    if (imageUrl) {
      background = new Image();
      background.src = imageUrl;
      background.crossOrigin = 'anonymous';
    } else {
      background = this.defaultBackgroundImage;
    }
    this.backgroundImage = background;
  }

  public clearBackground() {
    this.backgroundColor = '';
    this.backgroundImage = this.defaultBackgroundImage;
  }

  public setBackgroundColor(color: string) {
    this.backgroundImage = this.defaultBackgroundImage;
    this.backgroundColor = color;
  }

  public display(
    canvas: HTMLCanvasElement,
    canvasCtx: CanvasRenderingContext2D
  ) {
    if (!this.videoBackgroundMode) {
      if (this.backgroundColor) {
        // Display background color
        canvasCtx.fillStyle = this.backgroundColor;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Display background image
        const { width, height } = this.backgroundImage;

        const ratio = Math.max(canvas.width / width, canvas.height / height);
        // get the top left position of the image
        const x = canvas.width / 2 - (width / 2) * ratio;
        const y = canvas.height / 2 - (height / 2) * ratio;
        canvasCtx.drawImage(
          this.backgroundImage,
          x,
          y,
          width * ratio,
          height * ratio
        );
      }
    }

    // Display items
    for (const item of this.items) {
      const position = this.itemPlacements.get(
        isCanvasText(item) ? item.getId() : item.src
      );
      const size = this.itemSizes.get(
        isCanvasText(item) ? item.getId() : item.src
      );

      // Width and height of item relative to preview canvas
      const relativeWidth = size.width * size.zoomFactor;
      const relativeHeight = size.height * size.zoomFactor;
      const topLeftXRelative = position.x - relativeWidth / 2;
      const topLeftYRelative = position.y - relativeHeight / 2;

      // Ratios for mapping onto window resolution dimensions
      const widthRatio =
        this.windowResolution.width / this.previewCanvasSize.width;
      const heightRatio =
        this.windowResolution.height / this.previewCanvasSize.height;

      if (isCanvasText(item)) {
        item.display(
          canvasCtx,
          topLeftXRelative * widthRatio,
          topLeftYRelative * heightRatio,
          relativeWidth * widthRatio,
          relativeHeight * heightRatio
        );
      } else {
        canvasCtx.drawImage(
          item,
          topLeftXRelative * widthRatio,
          topLeftYRelative * heightRatio,
          relativeWidth * widthRatio,
          relativeHeight * heightRatio
        );
      }
    }
  }

  public setCanvasSize(size: Size) {
    this.previewCanvasSize = size;
  }

  public getCanvasSize() {
    return this.previewCanvasSize;
  }

  public resetItemPlacements() {
    this.itemPlacements.forEach((value, key) => {
      this.itemPlacements.set(key, { x: 0, y: 0 });
    });
  }

  public resetItemSizes() {
    this.itemSizes.forEach((size, key) => {
      this.itemSizes.set(key, { ...size, zoomFactor: size.defaultZoomFactor });
    });
  }

  public updateItems(newItems: SceneItemType[]) {
    this.items = newItems;
  }
}
