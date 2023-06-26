import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { Placement } from 'renderer/types';
import { Rnd } from 'react-rnd';

import './style.css';

interface DraggableProps {
  x: number;
  y: number;
  width: number;
  height: number;
  setPos: (x: number, y: number) => void;
  setSize?: (e) => Placement;
  lockAspectRatio?: boolean;
  zIndex?: number;
}

const Draggable = (props: DraggableProps) => {
  const { x, y, width, height, setPos, setSize, lockAspectRatio, zIndex } =
    props;
  const rndRef = useRef<Rnd>();
  useEffect(() => {
    if (rndRef.current) {
      rndRef.current.updateSize({ width, height });
      rndRef.current.updatePosition({ x: x - width / 2, y: y - height / 2 });
    }
  }, [rndRef, x, y, width, height]);

  const onWheel = (e) => {
    const newPos: Placement = setSize(e);
    rndRef.current?.updatePosition({
      x: newPos?.x,
      y: newPos?.y,
    });
  };

  const style = {
    cursor: 'grab',
    zIndex: zIndex ?? 98,
  };

  return (
    <Box onWheel={onWheel}>
      <Rnd
        ref={rndRef}
        style={style}
        size={{
          width,
          height,
        }}
        className="react-rnd-item"
        onDrag={(e, d) => {
          const centerX = d.x + width / 2;
          const centerY = d.y + height / 2;
          setPos(centerX, centerY);
        }}
        lockAspectRatio={lockAspectRatio}
        enableResizing={false}
      />
    </Box>
  );
};

export default Draggable;
