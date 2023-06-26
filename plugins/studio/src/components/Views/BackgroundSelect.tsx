import React, { useState } from 'react';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Grid,
  useBreakpoint,
  useBreakpointValue
} from '@chakra-ui/react';
import { HexColorInput, HexColorPicker } from "react-colorful";

import Card from '../Card/AvatarCard';
import { NFTMetadata } from '../../types';
import { ipfsHashToImageUrl } from "../../utils/fileHandler";
import { useStyle } from '../../contexts/StyleContext';
import { colors } from '../../styles/theme';
import AssetCarousel from '../Carousel/AssetCarousel';

interface BackgroundSelectProps {
  selectedColor: string,
  setColor: (color: string) => void,
  scenes?: NFTMetadata[],
  selectedScene?: NFTMetadata,
  setScene?: (scene: NFTMetadata) => void
}

const BackgroundSelect = (props: BackgroundSelectProps) => {
  const {
    selectedColor,
    setColor,
    scenes,
    selectedScene,
    setScene
  } = props;
  const [mode, setMode] = useState<string>(scenes ? 'scene' : 'color'); // scene, color
  const { darkEnabled, selectDisplayMode, size } = useStyle();
  const bp = useBreakpoint();
  const responsiveNumItems = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 5 });

  let numItemsPerRow: number;
  switch(size) {
    case 'sm':
      numItemsPerRow = Math.max(2, responsiveNumItems - 3);
      break;
    case 'md':
      numItemsPerRow = Math.max(4, responsiveNumItems - 1);
      break;
    case 'lg':
      numItemsPerRow =  Math.max(5, responsiveNumItems);
      break;
    case 'xl':
      numItemsPerRow =  Math.max(6, responsiveNumItems + 1);
      break;
    default:
      numItemsPerRow = responsiveNumItems; // Default size is lg
  }

  const renderScenes = scenes?.map((scene, i) => {
    try {
      const currSceneId = `${scene.name}-${i}`;
      const selectedSceneId = `${selectedScene?.name}-${i}`;
      let imageUrl = scene?.image;
      // Handle ipfs hash to imageUrl conversion
      if (imageUrl.includes('ipfs://')) {
        imageUrl = ipfsHashToImageUrl(imageUrl);
        scene.image = imageUrl;
      }
      
      return (
        <Card
          key={`${currSceneId}-${i}`}
          isSelected={selectedSceneId ? currSceneId === selectedSceneId : false}
          imageUrl={scene.image}
          onSelect={() => setScene!(scene)}
        />
      )
    } catch (e) {
      console.error(scene, e);
    }
  });

  return (
    <Flex flexDir='column' justifyContent='center' alignItems='center' w='100%'>
      { scenes && (
         <Breadcrumb 
          fontSize='sm'
          fontWeight='bold'
          mb='20px'
          separator=''
          spacing={4}
        >
          <BreadcrumbItem
            textDecoration={mode === 'scene' ? 'underline' : 'none'}
            color={mode === 'scene' 
              ? colors.brand.primary
              : darkEnabled ? 'white' : 'black'
            }
            _hover={{
              textDecoration: 'none',
              color: colors.brand.primary
            }}
            textUnderlineOffset='6px'
          >
            <BreadcrumbLink 
              onClick={() => setMode('scene')}
            >
              Scenes
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem
            textDecoration={mode === 'color' ? 'underline' : 'none'}
            color={mode === 'color' 
              ? colors.brand.primary
              : darkEnabled ? 'white' : 'black'
            }
            _hover={{
              textDecoration: 'none',
              color: colors.brand.primary
            }}
            textUnderlineOffset='6px'
          >
            <BreadcrumbLink
              onClick={() => setMode('color')}
            >
              Colors
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      )}
      { mode === 'scene' && (
        selectDisplayMode === 'carousel' || bp === 'base'
        ?
          <AssetCarousel 
            assets={renderScenes} 
          />
        :
          <Grid 
            templateColumns={[
              'repeat(1, 1fr)', 
              'repeat(3, 1fr)', 
              `repeat(${numItemsPerRow}, 1fr)`
            ]}
            gap={8} 
            py={4} 
          >
            { scenes && renderScenes }
          </Grid>
      )}
      { mode === 'color' && (
        <Flex flexDir='column' justifyContent='center' alignItems='center'>
          <HexColorPicker 
            color={selectedColor} 
            onChange={setColor} 
            style={{ margin: '12px 0px'}} 
          />
          <HexColorInput 
            color={selectedColor} 
            onChange={setColor} 
            placeholder='Insert hex here'
            style={{ 
              borderRadius: '5px',
              padding: '3px',
              textAlign: 'center',
              display: 'block',
              boxSizing: 'border-box',
              border: '1px solid #ddd',
            }}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default BackgroundSelect;