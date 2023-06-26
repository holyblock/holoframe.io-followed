import { createContext, useContext, useState, useRef } from 'react';

export interface CanvasContextProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>;
  videoRef: React.MutableRefObject<HTMLVideoElement>;
}

const CanvasContext = createContext<CanvasContextProps | null>(null);

export const useCanvas = () => {
  return useContext(CanvasContext);
};

export const CanvasProvider = ({ children }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const value = {
    canvasRef,
    videoRef,
  };
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};
