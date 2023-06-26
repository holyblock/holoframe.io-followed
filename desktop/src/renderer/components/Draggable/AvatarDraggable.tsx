import { Box } from '@chakra-ui/react';
import { useEffect, useMemo, useRef } from 'react';
import { useSetting } from 'renderer/contexts/SettingContext';
import { Size, Placement, AvatarModel } from 'renderer/types';
import Draggable from '.';

interface AvatarDraggableProps {
  avatarModel: AvatarModel;
  placement: Placement;
  setPlacement: (placement: Placement) => void;
  zoomFactor: number;
  setZoomFactor: (zoomFactor: number) => void;
  canvasSize: Size;
  refresh: number;
}

const MIN_WIDTH = 100;
const ZOOM_FACTOR_DELTA = 0.05; // size to add or minus upon each scroll

const AvatarDraggable = (props: AvatarDraggableProps) => {
  const {
    avatarModel,
    placement,
    setPlacement,
    zoomFactor,
    setZoomFactor,
    canvasSize,
    refresh,
  } = props;
  const { cameraMirrored } = useSetting();

  const zoomFactorRef = useRef<number>(zoomFactor);
  const size = {
    width: avatarModel?.avatarSize?.width * zoomFactor,
    height: avatarModel?.avatarSize?.height * zoomFactor,
  };

  // Scroll event handler for resizing avatar
  const handleScroll = (e) => {
    const wDelta = e.deltaY > 0 ? 'down' : 'up';
    let newZoomFactor = zoomFactorRef.current;

    // Get the floor for zoom factor
    const minZoomFactor = MIN_WIDTH / avatarModel.avatarSize.width;

    // Detect direction and increment or decrement zoom factor
    if (wDelta === 'down') {
      // Zoom in (enlarge avatar)
      newZoomFactor = Math.min(2, newZoomFactor + ZOOM_FACTOR_DELTA);
    } else {
      // Zoom out (shrink avatar)
      newZoomFactor = Math.max(
        minZoomFactor,
        newZoomFactor - ZOOM_FACTOR_DELTA
      );
    }

    // Get new placement
    const newWidth = avatarModel.avatarSize.width * newZoomFactor;
    const newHeight = avatarModel.avatarSize.height * newZoomFactor;
    const newUpperLeftX = placement.x - newWidth / 2;
    const newUpperLeftY = placement.y - newHeight / 2;
    const newPlacement = { x: newUpperLeftX, y: newUpperLeftY };

    // Update references
    zoomFactorRef.current = newZoomFactor;
    setZoomFactor(newZoomFactor);

    return newPlacement;
  };

  const setPos = (x, y) => {
    setPlacement({ x: cameraMirrored ? canvasSize.width - x : x, y });
  };

  // Reset upon avatar selection
  useEffect(() => {
    zoomFactorRef.current = zoomFactor;
  }, [avatarModel]);

  const avatarPlacement = useMemo(() => {
    if (placement) return placement;
    return {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
    };
  }, [placement]);

  return (
    <Box key={`avatar-model-${refresh}`}>
      <Draggable
        x={
          cameraMirrored
            ? canvasSize.width -
              (avatarPlacement.x ?? avatarModel?.avatarPlacement.x)
            : avatarPlacement.x ?? avatarModel?.avatarPlacement.x
        }
        y={avatarPlacement.y ?? avatarModel?.avatarPlacement.y}
        width={size.width}
        height={size.height}
        setPos={setPos}
        setSize={handleScroll}
        lockAspectRatio
        zIndex={98} // Ensure this is below face tracking button on canvas
      />
    </Box>
  );
};

export default AvatarDraggable;
