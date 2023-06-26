import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Box, Flex, Image, Heading, Text } from '@chakra-ui/react';
import { faceKey } from '../../../settings';
import { colors } from '../../styles/theme';

const StudioComponent: any = dynamic(() => import('../../components/HologramStudio'), {
  ssr: false
});
const Froyoverse = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const indexRef = useRef(0);
  

  const nftMetadata = [
    {
      "name": "Froyoverse",
      "description": "Froyo kitten, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/froyoverse/Froyoverse_Sample.zip",
      "image": ""
    },
    {
      "name": "Froyoverse",
      "description": "Froyo kitten, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://hologramxyz.s3.amazonaws.com/ios/models/samples/froyo1.zip",
      "image": "https://hologramxyz.s3.amazonaws.com/ios/thumbnails/samples/froyo1.jpg"
    },
    {
      "name": "Froyoverse",
      "description": "Froyo kitten, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://hologramxyz.s3.amazonaws.com/ios/models/samples/froyo2.zip",
      "image": "https://hologramxyz.s3.amazonaws.com/ios/thumbnails/samples/froyo2.jpg"
    },
    {
      "name": "Froyoverse",
      "description": "Froyo kitten, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://hologramxyz.s3.amazonaws.com/partnerships/FroyoKitten/live2d/v1/0079e3926afe584565678a41a8175534.zip",
      "image": "https://hologramxyz.s3.amazonaws.com/ios/thumbnails/samples/froyo3.jpg"
    },
    {
      "name": "Froyoverse",
      "description": "Froyo kitten, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://hologramxyz.s3.amazonaws.com/partnerships/FroyoKitten/live2d/v1/00f9dcd27a884a61fb00f67ada04be91.zip",
      "image": "https://hologramxyz.s3.amazonaws.com/ios/thumbnails/samples/froyo3.jpg"
    },
    {
      "name": "Froyoverse",
      "description": "Froyo kitten, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://hologramxyz.s3.amazonaws.com/partnerships/FroyoKitten/live2d/v1/0150284457c8685fd344556af92e4e43.zip",
      "image": "https://hologramxyz.s3.amazonaws.com/ios/thumbnails/samples/froyo3.jpg"
    },
    {
      "name": "Froyoverse",
      "description": "Froyo kitten, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://hologramxyz.s3.amazonaws.com/ios/models/samples/froyo3.zip",
      "image": "https://hologramxyz.s3.amazonaws.com/ios/thumbnails/samples/froyo3.jpg"
    },
    {
      "name": "Froyoverse",
      "description": "Froyo kitten, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://hologramxyz.s3.amazonaws.com/partnerships/FroyoKitten/live2d/v1/0067af7bff1e7c06f060fbc76a73c8a1.zip",
      "image": ""
    },
    {
      "name": "Froyo",
      "project": "froyo",
      "description": "froyo, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://hologramxyz.s3.amazonaws.com/partnerships/FroyoKitten/live2d/v1/023331e10b9826ed27a639c0bb3d588e.zip",
      "image": ""
    },
    {
      "name": "Anata",
      "description": "Cozy, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/anata-honoraries-2/4.zip",
      "image": ""
    },
    {
      "name": "Anata",
      "description": "Darren Lau, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/anata-honoraries/10.zip",
      "image": ""
    }, 
    {
      "name": "Anata",
      "description": "Miyu, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/anata-honoraries-2/16.zip",
      "image": ""
    },
    {
      "name": "Anata",
      "description": "Tuba, powered by hologram.xyz",
      "type": "live2d",
      "animation_url": "",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/anata-honoraries-2/18.zip",
      "image": ""
    },
    {
      "name": "Anata",
      "project": "anata",
      "description": "Milady #407, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/anata-honoraries/8.zip",
      "image": ""
    }, 
    
    {
      "name": "Doodles-3590",
      "project": "doodles",
      "description": "Doodles #3590, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/doodle3590.zip",
      "image": "https://lh3.googleusercontent.com/mZicy0WsDh52Abt43Z_NVqpjhZ03E29GGm22IEf3hiigtbyO1E5wKNVAXLB-PMDBYDiZ-uV4uOktQNxTQomU8KVzdYMftcHg5jDfoQ=w600"
    },
    {
      "name": "Penguins",
      "type": "live2d",
      "description": "",
      "format": "live2d",
      "model_url": "https://hologramxyz.s3.amazonaws.com/creator/0x7949Ae9C02a8815Abb876f93B0B3fD8F076055bd/collections/uZm3DCCCeb60MWxSTMCX/models/pudgypenguin6873.zip",
      "image": "",
    },
    
    {
      "name": "CoolCats-407",
      "project": "coolcats",
      "description": "Cool Cat #407, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/coolcat407.zip",
      "image": "https://arweave.net/b6ALccGZGpTAW0ZyMy75BHCMDLIBKRd9CaMig4pYdsw"
    },
    {
      "name": "Moonbirds",
      "project": "coolcats",
      "description": "Cool Cat #407, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://hologramxyz.s3.amazonaws.com/creator/0x7949Ae9C02a8815Abb876f93B0B3fD8F076055bd/collections/uZm3DCCCeb60MWxSTMCX/models/moonbirds2709.zip",
      "image": ""
    },
    {
      "name": "Milady",
      "project": "milady",
      "description": "Milady #407, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/milady/1.zip",
      "image": ""
    },
    {
      "name": "Milady",
      "project": "milady",
      "description": "Milady #407, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/milady/5.zip",
      "image": ""
    }, 
    
    {
      "name": "Goblin",
      "project": "goblin",
      "description": "Goblin, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://hologramxyz.s3.amazonaws.com/creator/0x7949Ae9C02a8815Abb876f93B0B3fD8F076055bd/collections/uZm3DCCCeb60MWxSTMCX/models/Goblin_4626.zip",
      "image": ""
    },
    {
      "name": "Tubby",
      "project": "tubby",
      "description": "tubby, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://hologramxyz.s3.amazonaws.com/creator/0x7949Ae9C02a8815Abb876f93B0B3fD8F076055bd/collections/uZm3DCCCeb60MWxSTMCX/models/tubby_xmon.zip",
      "image": ""
    },
  ];

  useEffect(() => {
    setInterval(() => {
      const newIndex = (indexRef.current + 1) % nftMetadata.length;
      indexRef.current = newIndex;
      setSelectedIndex(newIndex);
    }, 30000);
  }, []);

  return (
    <Box pos='relative' w='100vw' padding={0}>
      <StudioComponent 
        apiKey={faceKey!}
        nftMetadataList={nftMetadata}
        selectedAvatarIndex={indexRef.current}
        fullscreenEnabled
        trackingMode='face'
        defaultBackgroundURL='https://rolling-filters.s3.amazonaws.com/live2d/froyoverse/froyoverse-background.jpg'
        disableBannerKey='rollingtech21'
        disableLoadingScreen
      />
      <Flex
        backgroundColor={'white'}
        borderColor={colors.brand.primary}
        maxW='container.sm'
        flexDir='column'
        justifyContent='center'
        alignItems='left'
        pos='absolute'
        bottom={0}
        left={0}
        borderRadius={5}
        p={4}
      >
        <Heading
          color='black'
          textAlign='center'
          fontSize='30px'
          fontWeight='bold'
        >
          👾 Hologram Giveaway 👾
        </Heading>
        <Text
          pt={4}
          color='black'
          textAlign='left'
          fontSize='20px'
        >
          🐦 Scan the QR codes to join our Discord & follow us on Twitter
        </Text>
        <Text
          pt={4}
          color='black'
          textAlign='left'
          fontSize='20px'
        >
          📸 Take a photo, post it to #general on Discord and drop us a line!
        </Text>
        <Text
          pt={4}
          color='black'
          textAlign='left'
          fontSize='20px'
        >
          ✍️  Include your Twitter handle & wallet address in your entry
        </Text>
        <Text
          pt={4}
          color='black'
          textAlign='left'
          fontSize='20px'
          fontWeight='bold'
        >
          💰 Prizes include 2049 USDC & Membership Pass whitelist spots
        </Text>
        <Flex pt={4} justifyContent='center'>
          <Box pr={2} boxSize='128px'>
            <Image src='https://hologramxyz.s3.amazonaws.com/marketing/qr-code/hologram-discord-qr.png'/>
          </Box>
          <Box pl={2} boxSize='128px'>
            <Image src='https://hologramxyz.s3.amazonaws.com/marketing/qr-code/hologram-twitter-qr.png'/>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Froyoverse;