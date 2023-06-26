import { createContext, useContext, useState, useRef } from 'react';
import useDebounce from 'renderer/hooks/useDebounce';

export interface CanvasContextProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>;
  videoRef: React.MutableRefObject<HTMLVideoElement>;
  pictureInPictureRef: React.MutableRefObject<HTMLVideoElement>;
  fullscreenEnabled: boolean;
  realtimeFPS: number;
  setFullscreenEnabled: (enabled: boolean) => void;
  setRealtimeFPS: (fps: number) => void;
}

const CanvasContext = createContext<CanvasContextProps | null>(null);

export const useCanvas = () => {
  return useContext(CanvasContext);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CanvasProvider = ({ children }: any) => {
  const [fullscreenEnabled, setFullscreenEnabled] = useState(false);
  const [realtimeFPS, setRealtimeFPS] = useState<number>(0);
  const debouncedFPS = useDebounce<number>(realtimeFPS, 10);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pictureInPictureRef = useRef<HTMLVideoElement>(null);
  const value = {
    canvasRef,
    videoRef,
    pictureInPictureRef,
    fullscreenEnabled,
    setFullscreenEnabled,
    realtimeFPS: debouncedFPS,
    setRealtimeFPS,
  };
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};
