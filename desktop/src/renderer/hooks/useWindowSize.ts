import React, { useEffect, useState } from 'react';
import { Size } from 'renderer/types/types';
import config from '../../../../utils/config';

const useWindowSize = () => {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<Size>({
    width: undefined,
    height: undefined,
  } as Size);
  const [canvasSize, setCanvasSize] = useState<Size>({
    width: undefined,
    height: undefined,
  } as Size);
  const [canvasRatio, setCanvasRatio] = useState<number>(9 / 16);
  // Pixel size of maximum screen size that can be adjusted by user
  const [previewScreenSize, setPreviewScreenSize] = useState(
    config.video.widths.md
  );
  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      } as Size);
    };
    // Add event listener
    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return {
    windowSize,
    canvasSize,
    setCanvasSize,
    canvasRatio,
    setCanvasRatio,
    previewScreenSize,
    setPreviewScreenSize,
  };
};
export default useWindowSize;
