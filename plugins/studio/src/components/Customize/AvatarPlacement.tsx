import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
} from '@chakra-ui/react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import Draggable from 'react-draggable';
import useWindowSize, { WindowSize } from '../../hooks/useWindowSize';
import { useStyle } from '../../contexts/StyleContext';
import { AvatarModel } from '../../types';
import constants from '../../config/constants';
import { colors } from '../../styles/theme';

const PLACEMENT_CANVAS_WIDTH = 320;
const PLACEMENT_CANVAS_HEIGHT = 180;
const AVATAR_WIDTH = 100;
const AVATAR_HEIGHT = 136;
const CENTER_X = (PLACEMENT_CANVAS_WIDTH - AVATAR_WIDTH) / 2;
const CENTER_Y = (PLACEMENT_CANVAS_HEIGHT - AVATAR_HEIGHT) / 2;

interface AvatarPlacementProps {
  avatarModel: AvatarModel | null
}

const AvatarPlacement = (props: AvatarPlacementProps) => {
  const { avatarModel } = props;
  const { darkEnabled, modelSize, setModelSize } = useStyle();
  const windowSize: WindowSize = useWindowSize();

  const defaultWidth = modelSize * 100;
  const [width, setWidth] = useState(!Number.isNaN(defaultWidth) ? defaultWidth : 100); // avatar width
  const defaultX = (PLACEMENT_CANVAS_WIDTH - width) / 2;
  const defaultY = (PLACEMENT_CANVAS_HEIGHT - width * (AVATAR_HEIGHT / AVATAR_WIDTH)) / 2;
  const [x, setX] = useState(!Number.isNaN(defaultX) ? defaultX : CENTER_X);
  const [y, setY] = useState(!Number.isNaN(defaultY) ? defaultY : CENTER_Y);
  const [centerXRelative, setCenterXRelative] = useState(0.5);
  const [centerYRelative, setCenterYRelative] = useState(0.5);

  useEffect(() => {
    if (width) {
      updateSize();  
    }
  }, [width, modelSize]);

  useEffect(() => {
    (async () => {
      await avatarModel?.setModelPlacement(centerXRelative, centerYRelative);
    })();
  }, [centerXRelative, centerYRelative]);

  // Calculate x and y offset and update model placement to content script
  const updatePlacement = (e: any) => {
    // Calculate offsets
    const canvasYOffset = document.getElementById('placementCanvas')?.getBoundingClientRect().top;
    const avatarRect = e.target.getBoundingClientRect();
    const centerX = (avatarRect.right + avatarRect.left) / 2;
    const centerY = (avatarRect.bottom + avatarRect.top) / 2; 
    

    // Set x and y (top left corner)
    setX(avatarRect.left - (windowSize.width! - PLACEMENT_CANVAS_WIDTH) / 2);
    setY(avatarRect.top - canvasYOffset!);

    // Set relative center x and y
    setCenterXRelative(
      (centerX - (windowSize.width! - PLACEMENT_CANVAS_WIDTH) / 2) / PLACEMENT_CANVAS_WIDTH
    );
    setCenterYRelative((centerY - canvasYOffset!) / PLACEMENT_CANVAS_HEIGHT);
  }

  // Linear transform width to factor, and notify content script
  const updateSize = async () => {
    const newSizeFactor = width / 100;
    await avatarModel?.setSizeFactor(newSizeFactor);
    setModelSize(newSizeFactor);
 }

  const onZoomIn = () => {
    // Increase width
    setWidth(width => {
      if (width < 200) {
        // Re-center
        setX(x - 1);
        setY(y - 1);
        // Zoom in by a step of 2
        return width + 2;
      } else {
        return 200;
      }
    });
  }

  const onZoomOut = () => {
    // Descrease width
    setWidth(width => {
      if (width > 0) {
        // Re-center
        setX(x + 1);
        setY(y + 1);
        // Zoom out by a step of 2
        return width - 2;
      } else {
        return 0;
      }
    });
  }


  return (
    <Flex flexDir='column' alignItems='center'>
      <Box
        id='placementCanvas'
        w={PLACEMENT_CANVAS_WIDTH}
        h={PLACEMENT_CANVAS_HEIGHT}
        backgroundColor={darkEnabled ? 'white' : 'black'}
        mb={3}
        borderRadius={5}
        overflow='hidden'
      >
        <Draggable
          axis='both'
          handle='.handle'
          defaultPosition={{x: x, y: y}}
          position={{ x: x, y: y }}
          grid={[5, 5]}
          scale={1}
          onDrag={updatePlacement}
          onStop={updatePlacement}
        >
          <div>
            <img 
              className='handle' 
              draggable={false}
              style={{
                cursor: 'grab',
              }}
              src={constants.assets.holo} 
              width={width}
              height='100%'
            />
          </div>
        </Draggable>
      </Box>
      <Flex justifyContent='space-between'>
        <IconButton 
          aria-label='ZoomOut'
          icon={<AiOutlineMinus />} 
          variant='ghost' 
          color={darkEnabled ? 'white' : 'black'}
          margin='0'
          colorScheme='transparent'
          _hover={{
            color: colors.brand.primary
          }}
          onClick={onZoomOut}
        />
        <Slider 
          colorScheme='purple'
          defaultValue={width / 2} 
          w={250} 
          onChange={(v) => {
            const oldCenterX = x + width / 2;
            const oldCenterY = y + width * (AVATAR_HEIGHT / AVATAR_WIDTH) / 2;
            setX(oldCenterX - v);
            setY(oldCenterY - v * (AVATAR_HEIGHT / AVATAR_WIDTH));
            setWidth(v * 2);
          }}
          value={width / 2}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <IconButton 
          aria-label='ZoomIn'
          icon={<AiOutlinePlus />} 
          variant='ghost' 
          color={darkEnabled ? 'white' : 'black'}
          margin='0'
          colorScheme='transparent'
          _hover={{
            color: colors.brand.primary
          }}
          onClick={onZoomIn}
        />
      </Flex>
    </Flex>
  );
};

export default AvatarPlacement;