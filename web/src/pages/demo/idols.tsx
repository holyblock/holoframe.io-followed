import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Flex, Text } from '@chakra-ui/react';
import { faceKey } from '../../../settings';

const StudioComponent: any = dynamic(() => import('../../components/HologramStudio'), {
  ssr: false
});
const Idols = () => {
  const nftMetadata = [
    {
      "name": "The Idols (Neptune)",
      "description": "Test NFT for Neptune, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/idols/neptune.zip",
      "image": "https://rolling-filters.s3.amazonaws.com/images/idols/neptune.jpeg"
    }
  ]
  return (
    <Flex
      flexDir='column'
      h='100vh'
      justifyContent='center'
      alignItems='center'
    >
      <Box h='657px'>
        <StudioComponent 
          apiKey={faceKey!}
          nftMetadataList={nftMetadata}
          trackingMode='face'
          defaultBackgroundURL='https://rolling-filters.s3.amazonaws.com/live2d/idols/idols-background-landscape.jpg'
          disableBannerKey='rollingtech21'
          size='xl'
        />
      </Box>
      <Flex
        maxW='container.sm'
        flexDir='column'
        justifyContent='center'
        alignItems='start'
      >
        <Text
          mt='40px'
          color='black'
          textAlign='start'
          fontSize='20px'
          fontWeight='bold'
        >
          The Idols NFT x Hologram Labs
        </Text>
        <Text
          pt={4}
          color='black'
          textAlign='left'
          fontSize='20px'
        >
          This is an Idols NFT hologram owned by the Idols Chief Architect, Neptune. It was created in collaboration with Hologram Labs (hologram.xyz) and artist @nekokoro9.
        </Text>
      </Flex>
      
    </Flex>
    
  );
};

export default Idols;