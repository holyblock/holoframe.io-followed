import React, { useRef } from 'react';
import { Box, Center, Grid, Flex, VStack, Text, Tooltip, useBreakpoint, useBreakpointValue } from '@chakra-ui/react';
import { ArrowUpIcon } from '@chakra-ui/icons';
import Card from '../Card/AvatarCard';
import { useStyle } from '../../contexts/StyleContext';
import { NFTMetadata } from '../../types';
import AssetCarousel from '../Carousel/AssetCarousel';
import { colors } from '../../styles/theme';
import { ipfsHashToImageUrl } from '../../utils/fileHandler';

interface AvatarGridProps {
  assets: NFTMetadata[]
  selectedIndex: number //NFTMetadata
  onSelect: (avatarIndex: number) => void
  uploadEnabled?: boolean
  onInput: (e: any) => void
}

// Grid for demoing avatars
const AvatarGrid = (props: AvatarGridProps) => {
  const {
    assets,
    selectedIndex,
    onSelect,
    uploadEnabled,
    onInput
  } = props;
  const { darkEnabled, size, selectDisplayMode } = useStyle();
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
  const hiddenFileInput = useRef<any>(null);

  const renderAvatars = assets.map((metadata: NFTMetadata, i: number) => {
    const avatarId = `${metadata.name}-${i}`;
    metadata.id = avatarId;
    let imageSrc = metadata.image;
    if (imageSrc.includes('ipfs://')) {
      imageSrc = ipfsHashToImageUrl(imageSrc);
      metadata.image = imageSrc;
    };
    try {
      return (
        <Card
          key={`${metadata.name}-${i}`}
          isSelected={selectedIndex === i}
          imageUrl={metadata.image}
          onSelect={() => {
            onSelect(i);
          }}
        />
      )
    } catch (e) {
      console.error(metadata, e);
    }
  })

  const onUpload = () => {
    hiddenFileInput.current.click();
  };

  const renderUploadCard = () => {
    return (
      <>
        <Tooltip label='Accepts .zip (live2D), .glb, and .vrm files' key={'upload'}>
          <Box
            rounded={'md'}
            color={darkEnabled ? 'white' : 'black'}
            w={150}
            h={150}
            textAlign='center'
            _hover={{
              opacity: 1,
              cursor: 'pointer',
              outline: `4px solid ${colors.brand.primary}`,
              color: colors.brand.primary
            }}
            onClick={onUpload}
          >
            <Center h='100%'>
              <VStack>
                <ArrowUpIcon 
                  color={darkEnabled ? 'white' : 'black'} 
                  boxSize={8} 
                />
                <Text 
                  color={darkEnabled ? 'white' : 'black'}
                >
                  Upload Model
                </Text>
              </VStack>
            </Center>
          </Box>
        </Tooltip>
        <input
          ref={hiddenFileInput}
          onInput={onInput}         
          type="file"
          accept=".zip,.7zip,.glb,.vrm"
          style={{ display: 'none' }}
        />
      </>
    )
  }
  
  return (
    <Flex 
      justifyContent='center' 
      alignItems='center' 
    >
      { selectDisplayMode === 'carousel' || bp === 'base'
        ?
          <AssetCarousel 
            assets={renderAvatars} 
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
            { renderAvatars }
            { uploadEnabled && renderUploadCard() }
          </Grid>
      }
    </Flex>
  );
};

export default AvatarGrid;