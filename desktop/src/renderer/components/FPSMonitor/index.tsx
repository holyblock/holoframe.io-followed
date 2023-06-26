import { useCanvas } from 'renderer/contexts/CanvasContext';

const FPSMonitor = () => {
  const { realtimeFPS } = useCanvas();
  return (
    <div style={{ color: 'red', opacity: 0.7 }}>
      FPS: {realtimeFPS.toFixed(3)}
    </div>
  );
};

export default FPSMonitor;
