import create from 'zustand';
import shallow from 'zustand/shallow';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';
import React, { useCallback } from 'react';
import { AvatarModel } from '@/types';

export enum UIMode {
  Default,
  Avatar,
  Wardrobe,
}

export enum WardrobeMode {
  Shirt,
  Hat,
  Glasses,
  Earrings,
}

export enum EnvironmentMode {
  Back,
  Face,
  Hand,
}

const useModelStore = create(
  subscribeWithSelector((set) => {
    return {
      dom: null,
      gl: THREE.WebGLRenderer,
      setGL: (gl) => set({ gl }),
      capturingImage: false,
      setCapturingImage: (capturingImage) => set({ capturingImage }),
      imageData: '',
      setImageData: (imageData) => set({ imageData }),
      outputCanvas: null,
      setOutputCanvas: (canvas) => set({ outputCanvas: canvas }),
      uiMode: UIMode.Wardrobe,
      setUIMode: (uiMode) => set({ uiMode }),
      wardrobeMode: WardrobeMode.Shirt,
      setWardrobeMode: (wardrobeMode) => set({ wardrobeMode }),
      trackingEnabled: false,
      setTrackingEnabled: (trackingEnabled) => set({ trackingEnabled }),
      selectedModel: React.createRef<AvatarModel>(),
      selectedModelData: {
        name: 'BAYC',
        image:
          'https://rolling-filters.s3.amazonaws.com/images/Bored_Ape_4249.jpeg',
        model_url:
          'https://rolling-filters.s3.amazonaws.com/3d/Ape_Body_Base_Final_SkinWeight.glb',
      },
      // selectedModelData: {
      //   name: 'Pudgy Penguins',
      //   image: 'https://rolling-filters.s3.amazonaws.com/images/pudgypenguins.png',
      //   model_url: 'https://rolling-filters.s3.amazonaws.com/3d/Pudgy_Penguin_Blendshape_Tier123.glb',
      // },
      setSelectedModelData: (selectedModelData) => set({ selectedModelData }),
      selectedEnvironmentData: {
        name: 'Hologram Room',
        image: 'https://rolling-filters.s3.amazonaws.com/images/holo-room.png',
        model_url:
          'https://hologramxyz.s3.amazonaws.com/backgrounds/3d/spacepod.glb',
      },
      setSelectedEnvironmentData: (selectedEnvironmentData) =>
        set({ selectedEnvironmentData }),
      selected2DEnvironmentData: {
        name: 'No Room',
        image: null,
      },
      setSelected2DEnvironmentData: (selected2DEnvironmentData) =>
        set({ selected2DEnvironmentData }),
      selectedClothingData: [
        {
          name: 'Argentina Home Jersey',
          image:
            'https://hologramxyz.s3.amazonaws.com/nft/wc/images/home/Argentina-69.gif',
          model_url:
            'https://rolling-filters.s3.amazonaws.com/3d/WC+Jerseys/BAYC/jersey-home-argentina-ape.glb',
          category: 'clothing',
        },
      ],
      // selectedClothingData: [{
      //   name: `Argentina Home Jersey`,
      //   image: `https://hologramxyz.s3.amazonaws.com/nft/wc/images/home/argentina-69.gif`,
      //   model_url: `https://rolling-filters.s3.amazonaws.com/3d/WC+Jerseys/PPG/WC_Argentina_Home_SkinWeight.glb`,
      //   category: 'clothing',
      // }],
      setSelectedClothingData: (selectedClothingData) =>
        set({ selectedClothingData }),
      cameraPos: { x: 0, y: 0.8, z: 3 },
      setCameraPos: (cameraPos) => set({ cameraPos }),
      modelPos: { x: 0, y: 0, z: 0 },
    };
  })
);

const useStore = (sel) => useModelStore(sel, shallow);
Object.assign(useStore, useModelStore);

const { getState, setState, subscribe } = useModelStore;

export { getState, setState, subscribe };
export default useStore;
