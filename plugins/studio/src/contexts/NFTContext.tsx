import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  MutableRefObject,
} from 'react';
// import defaultAssets from '../../assets';
// import localforage from 'localforage';

import { AvatarModel, Placement, NFTMetadata } from '../types';

export interface NFTContextProps {
  allAvatars: NFTMetadata[];
  avatarIndex: number | undefined;
  selectedScene: NFTMetadata | undefined;
  selectedBgColor: string;
  expressions: Map<string, Array<object>> | undefined;
  selectedExps: string[];
  modelEnabled: boolean;
  avatarModel: MutableRefObject<AvatarModel | null>;
  setAllAvatars: (avatars: NFTMetadata[]) => void;
  setAvatarIndex: (index: number) => void;
  setSelectedScene: (scene: NFTMetadata) => void;
  setSelectedBgColor: (color: string) => void;
  setExpressions: (exps: Map<string, object[]>) => void;
  setSelectedExps: (exps: string[]) => void;
  setModelEnabled: (enabled: boolean) => void;
  setAvatarModel: (model: AvatarModel) => void;
}

const NFTContext = createContext<NFTContextProps | null>(null);

export const useNFT = () => {
  return useContext(NFTContext);
};

export const NFTProvider = ({ children }: any) => {
  const [allAvatars, _setAllAvatars] = useState<NFTMetadata[]>([]);
  const [avatarIndex, _setAvatarIndex] = useState<number>();
  const [selectedScene, _setSelectedScene] = useState<NFTMetadata>();
  const [selectedBgColor, _setSelectedBgColor] = useState<string>('');
  const [expressions, _setExpressions] = useState<Map<string, Array<object>>>();
  const [selectedExps, _setSelectedExps] = useState<string[]>([]);
  const [modelEnabled, _setModelEnabled] = useState(false);
  const avatarModel = useRef<AvatarModel | null>(null);

  const setAllAvatars = (avatars: NFTMetadata[]) => {
    _setAllAvatars(avatars);
  };

  const setAvatarIndex = (newIndex: number) => {
    _setAvatarIndex(newIndex);
  };

  const setSelectedScene = (scene: NFTMetadata) => {
    _setSelectedScene(scene);
  };

  const setSelectedBgColor = (color: string) => {
    _setSelectedBgColor(color);
  };

  const setExpressions = (exps: Map<string, object[]>) => {
    _setExpressions(exps);
  };

  const setSelectedExps = (selected: string[]) => {
    _setSelectedExps(selected);
  };

  const setModelEnabled = (enabled: boolean) => {
    _setModelEnabled(enabled);
  };

  const setAvatarModel = (avatar: AvatarModel) => {
    avatarModel.current = avatar;
  };

  const value = {
    allAvatars,
    avatarIndex,
    selectedScene,
    selectedBgColor,
    expressions,
    selectedExps,
    modelEnabled,
    avatarModel,
    setAllAvatars,
    setAvatarIndex,
    setSelectedScene,
    setSelectedBgColor,
    setExpressions,
    setSelectedExps,
    setModelEnabled,
    setAvatarModel,
  };
  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
};
