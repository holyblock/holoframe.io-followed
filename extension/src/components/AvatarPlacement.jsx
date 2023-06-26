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
import Holo from '../assets/img/holo.png';
import { colors } from '../utils/theme';

const TOTAL_WIDTH = 360;
const WIDTH = 320;
const HEIGHT = 180;
const AVATAR_WIDTH = 100;
const AVATAR_HEIGHT = 136;
const Y_PADDING_HEIGHT = 68;
const CENTER_X = (WIDTH - AVATAR_WIDTH) / 2;
const CENTER_Y = (HEIGHT - AVATAR_HEIGHT) / 2;

const AvatarPlacement = () => {
  const [width, setWidth] = useState(AVATAR_WIDTH); // avatar width
  const [x, setX] = useState(CENTER_X);
  const [y, setY] = useState(CENTER_Y);

  // Update position and size from cache if it exists
  useEffect(() => {
    chrome.storage.sync.get([
      'avatarPreviewPlacement', 
      'avatarSize'
    ], async (res) => {
      if (res.avatarPreviewPlacement) {
        const [newX, newY] = res.avatarPreviewPlacement;
        setX(newX);
        setY(newY);
      }
      if (res.avatarSize) {
        setWidth(res.avatarSize * 100);
      }
    });
  }, []);
  
  // Content script communication helpers
  const notifyPlacement = (x, y, cache) => {
    // Notify content script
    const message = {
      source: "extension",
      type: "avatar_placement",
      placement: [x, y],
      cache: cache
    };
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message);
      });
    });
  };

  // Calculate x and y offset and update model placement to content script
  const updatePlacement = (e, cache) => {
    // Calculate offsets
    const rect = e.target.getBoundingClientRect();
    const centerX = (rect.right + rect.left) / 2;
    const centerY = (rect.bottom + rect.top) / 2; 
    const centerXRelative = (centerX - (TOTAL_WIDTH - WIDTH) / 2) / WIDTH;
    const centerYRelative = (centerY - Y_PADDING_HEIGHT) / HEIGHT;

    // Set x and y (top left corner) and update cache
    const newX = rect.left - (TOTAL_WIDTH - WIDTH) / 2;
    const newY = rect.top - Y_PADDING_HEIGHT;
    setX(newX);
    setY(newY);
    if (cache) {
      chrome.storage.sync.set({ 
        avatarPreviewPlacement: [newX, newY]
      });
    }

    // Notify content script
    notifyPlacement(centerXRelative, centerYRelative, cache);
  };

  const updateSize = (v, cache) => {
    const oldCenterX = x + width / 2;
    const oldCenterY = y + width * (AVATAR_HEIGHT / AVATAR_WIDTH) / 2;
    const newX = oldCenterX - v;
    const newY = oldCenterY - v * (AVATAR_HEIGHT / AVATAR_WIDTH);
    const newWidth = v * 2;
    const newSize = newWidth / 100;
    setX(newX);
    setY(newY);
    setWidth(newWidth);
    
    if (cache) {
      chrome.storage.sync.set({ 
        avatarPreviewPlacement: [newX, newY]
      });
    }
    notifySize(newSize, cache);
  };

  // Linear transform width to factor, and notify content script
  const notifySize = (newSize, cache) => {
    const message = {
     source: "extension",
     type: "avatar_size",
     size: newSize,
     cache: cache
   };
   chrome.tabs.query({}, tabs => {
     tabs.forEach(tab => {
       chrome.tabs.sendMessage(tab.id, message);
     });
   });
 };

  const onZoomIn = () => {
    // Increase width
    setWidth(width => {
      if (width <= 98) {
        // Re-center
        setX(x - 1);
        setY(y - 1);
        // Zoom in by a step of 2
        return width + 2;
      } else {
        return 100;
      }
    });
  }

  const onZoomOut = () => {
    // Descrease width
    setWidth(width => {
      if (width >= 2) {
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
    <Flex flexDir='column' alignItems='center' w='100vw'>
      <Box
        w={WIDTH}
        h={HEIGHT}
        backgroundColor='black'
        mb={3}
        borderRadius={5}
        overflow="hidden"
      >
        <Draggable
          axis="both"
          handle=".handle"
          defaultPosition={{x: x, y: y}}
          position={{ x: x, y: y }}
          grid={[5, 5]}
          scale={1}
          onDrag={(e) => updatePlacement(e, false)}
          onStop={(e) => updatePlacement(e, true)}
        >
          <div>
            <img 
              className="handle" 
              draggable={false}
              style={{
                cursor: "grab",
              }}
              src={Holo} 
              width={width}
              height="100%"
            />
          </div>
        </Draggable>
      </Box>
      <Flex justifyContent="space-between">
        <IconButton 
          icon={<AiOutlineMinus />} 
          variant="ghost" 
          color="white" 
          margin="0"
          colorScheme="transparent"
          _hover={{
            color: colors.brand.primary
          }}
          onClick={onZoomOut}
        />
        <Slider 
          colorScheme="purple" 
          defaultValue={width / 2} 
          w={250} 
          onChange={(v) => {
            updateSize(v);
          }}
          onChangeEnd={(v) => {
            updateSize(v, true);
          }}
          value={width / 2}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <IconButton 
          icon={<AiOutlinePlus />} 
          variant="ghost" 
          color="white" 
          margin="0"
          colorScheme="transparent"
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