export type OwnedNFT = {
  balance: string
  contract: { address: string }
  contractMetadata: {
    name: string
    openSea: { collectionName: string; imageUrl: string }
    symbol: string
    tokenType: string
    totalSupply: number
  }
  description: string
  id: { tokenId: string }
  media: Array<{
    bytes: number
    format: string
    gateway: string
    raw: string
    thumbnail: string
  }>
  metadata: {
    attributes: Array<{ value: any; trait_type: string }>
    description: string
    image: string
    name: string
  }
  title: string
  tokenUri: {
    gateway: string
    raw: string
  }
}

export interface NFTMetadata {
  name?: string
  project?: string
  description?: string
  type?: string
  format?: string
  model_url?: string
  image: string
  id?: string
  isHologram?: boolean
  category?: string
}

export enum ModelType {
  'live2d',
  '3d',
}

export enum ModelFormat {
  'glb',
  'vrm',
}

export enum ModelCategory {
  'hologram',
  'headwear',
  'eyewear',
  'clothing',
}

export enum SceneType {
  'image',
  'video',
  'window',
}

export interface Placement {
  x: number
  y: number
}

export interface Movement {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
}

export interface Size {
  width?: number
  height?: number
  zoomFactor?: number
}
