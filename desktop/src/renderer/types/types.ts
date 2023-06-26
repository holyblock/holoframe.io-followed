import CanvasText from 'renderer/utils/canvasText';

export interface NFTMetadata {
  name?: string;
  project?: string;
  description?: string;
  type?: string;
  format?: string;
  model_url?: string;
  image: string;
  id?: string;
  isHologram?: boolean;
}

export interface NFTCollection {
  name: string;
  symbol: string;
  network: string;
  image: string;
  assetURIs: NFTMetadata[];
}

export enum ModelType {
  'live2d',
  '3d',
}

export enum ModelFormat {
  'glb',
  'vrm',
}

export enum SceneType {
  'image',
  'video',
  'text',
  'window',
  'audio',
}

export interface Placement {
  x: number;
  y: number;
}

export interface Size {
  width?: number;
  height?: number;
  zoomFactor?: number;
  defaultZoomFactor?: number;
}

export function isCanvasText(
  item: HTMLImageElement | HTMLVideoElement | CanvasText
): item is CanvasText {
  return (item as CanvasText).calculateSize !== undefined;
}
