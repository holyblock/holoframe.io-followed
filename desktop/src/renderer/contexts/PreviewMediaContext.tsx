import { createContext, useContext, useState } from 'react';
import { MediaType } from '../../../../utils/types/index';

export interface PreviewMediaContextProps {
  previewMediaType: MediaType;
  setPreviewMediaType: (type: MediaType) => void;
  previewMediaDataUrl: string;
  setPreviewMediaDataUrl?: (url: string) => void;
  previewGifDataUrl: string;
  setPreviewGifDataUrl: (url: string) => void;
}

const PreviewMediaContext = createContext<PreviewMediaContextProps | null>(
  null
);

export const usePreviewMedia = () => {
  return useContext(PreviewMediaContext);
};

export const PreviewMediaProvider = ({ children }) => {
  const [previewMediaType, setPreviewMediaType] = useState<MediaType>();
  const [previewMediaDataUrl, setPreviewMediaDataUrl] = useState<string>('');
  const [previewGifDataUrl, setPreviewGifDataUrl] = useState<string>('');
  const value = {
    previewMediaType,
    setPreviewMediaType,
    previewMediaDataUrl,
    setPreviewMediaDataUrl,
    previewGifDataUrl,
    setPreviewGifDataUrl,
  };
  return (
    <PreviewMediaContext.Provider value={value}>
      {children}
    </PreviewMediaContext.Provider>
  );
};
