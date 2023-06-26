import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { useContextMenu } from 'react-contexify';
import { useSetting } from 'renderer/contexts/SettingContext';
import { useTextEditor } from 'renderer/contexts/TextEditorContext';
import { isCanvasText } from 'renderer/types/types';
import CanvasText from 'renderer/utils/canvasText';
import { Scene } from 'renderer/utils/scene';
import { v4 as uuidv4 } from 'uuid';
import Draggable from '.';
import ItemContextMenu from '../ContextMenu/Item';

interface ItemDraggableProps {
  scene: Scene;
  canvasWidth: number;
  canvasHeight: number;
  refresh: number;
}

const MIN_WIDTH = 100;
const ZOOM_FACTOR_DELTA = 0.05; // size to add or minus upon each scroll

const ItemDraggable = (props: ItemDraggableProps) => {
  const { scene, canvasWidth, canvasHeight, refresh } = props;
  const [render, setRender] = useState(1);
  const { setShowEditorModal, setCurrentText } = useTextEditor();
  const { show } = useContextMenu();
  const { cameraMirrored } = useSetting();

  const handleContextMenu = (event, id) => {
    event.preventDefault();
    show(event, {
      id,
    });
  };

  // Scroll event handler for resizing item
  const handleScroll = (e, url, zoomFactor) => {
    const wDelta = e.deltaY > 0 ? 'down' : 'up';
    let newZoomFactor = zoomFactor;

    // Get the floor for zoom factor
    const newSize = scene.getSize(url);
    const minZoomFactor = MIN_WIDTH / newSize.width;

    // Detect direction and increment or decrement zoom factor
    if (wDelta === 'down') {
      // Zoom in (enlarge item)
      newZoomFactor = Math.min(2, newZoomFactor + ZOOM_FACTOR_DELTA);
    } else {
      // Zoom out (shrink item)
      newZoomFactor = Math.max(
        minZoomFactor,
        newZoomFactor - ZOOM_FACTOR_DELTA
      );
    }

    // Set new size to Scene
    newSize.zoomFactor = newZoomFactor;
    scene.setSize(url, newSize);

    // Update draggable position
    const newWidth = newSize.width * newZoomFactor;
    const newHeight = newSize.height * newZoomFactor;
    const oldPlacement = scene.getPlacement(url);
    const newUpperLeftX = oldPlacement.x - newWidth / 2;
    const newUpperLeftY = oldPlacement.y - newHeight / 2;
    const newPlacement = { x: newUpperLeftX, y: newUpperLeftY };

    setRender((i) => i + 1);
    return newPlacement;
  };

  const handleDoubleClick = (
    item: HTMLImageElement | HTMLVideoElement | CanvasText
  ) => {
    if (isCanvasText(item)) {
      setShowEditorModal(true);
      setCurrentText(item);
    }
  };

  const renderItemDraggables = scene
    .getItems()
    .map((item: HTMLImageElement | HTMLVideoElement | CanvasText) => {
      const menuId = uuidv4();
      const itemId = isCanvasText(item) ? item.getId() : item.src;
      const itemPlacement = scene.getPlacement(itemId);
      const size = scene.getSize(itemId);
      const width = (size.width ?? canvasWidth) * size.zoomFactor;
      const height = (size.height ?? canvasHeight) * size.zoomFactor;

      return (
        <Box
          key={`${refresh}-${itemId}-${
            !isCanvasText(item) ? item.ariaLabel : ''
          }`}
          onContextMenu={(event) => handleContextMenu(event, menuId)}
          onDoubleClick={() => handleDoubleClick(item)}
        >
          <Draggable
            x={cameraMirrored ? canvasWidth - itemPlacement.x : itemPlacement.x}
            y={itemPlacement.y}
            width={width}
            height={height}
            setPos={(x, y) => {
              scene.setPlacement(itemId, {
                x: cameraMirrored ? canvasWidth - x : x,
                y,
              });
              setRender((i) => i + 1);
            }}
            setSize={(e) => {
              return handleScroll(e, itemId, size.zoomFactor);
            }}
            zIndex={97} // Ensure this is below avatar and facetracking button
          />
          <ItemContextMenu item={{ image: itemId }} id={menuId} />
        </Box>
      );
    });

  return <>{render && renderItemDraggables}</>;
};

export default ItemDraggable;
