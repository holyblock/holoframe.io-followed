import { useState } from 'react';
import { Box, Button, Divider, Text, Flex, Heading } from '@chakra-ui/react';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import NavigationBar from '../components/NavigationBar';
import SectionLabel from '../components/Label/SectionLabel';
import FooterBanner from '../components/NavigationFooter/FooterBanner';
import MacDownload from '../components/Modal/MacDownload';
import config from '../../../utils/config';

const Download = () => {
  const [macDownloadOpen, setMacDownloadOpen] = useState(false);
  return (
    <Box bg='white'>
      <NextSeo
        title='Download'
        description='Hologram chrome extension and desktop studio. Chat, stream, and immerse as your virtual characters.'
        openGraph={{
          title: 'Download',
          description: 'Hologram chrome extension and desktop studio. Chat, stream, and immerse as your virtual characters.',
          images: [
            {
              url: '/opengraph.png',
              alt: 'Hologram'
            }
          ]
        }}
      />
      <Flex flexDir='column'>
        {/* Intro banner */}
        <Flex
          flexDir='column'
          bgImage='url("/media/mask.svg"),url("/media/grain.svg"),url("/media/gradient-header.svg")'
          bgPos='center'
          bgRepeat='no-repeat'
          bgSize='cover'
          borderRadius={['5px', '20px']}
          m='5px'
          position='relative'
          zIndex={99}
        >
          {/* Nav bar */}
          <NavigationBar />
          {/* Heading */}
          <Flex
            flexDir='column'
            justifyContent='center'
            alignItems={'center'}
            pt={['30px', null, '50px', '50px']}
            pb={['70px', null, '100px']}
          >
            <SectionLabel
              text='Download'
              bgColor='rgba(255,255,255,0.2)'
            />
            <Heading 
              maxW='container.lg'
              textAlign='center'
              color='white'
              pt={['8px', null, '20px']}
              fontWeight='700'
              fontSize={['40px', null, '70px']}
              lineHeight={['34.8px', null, '67.2px']}
            >
              Try Hologram today!
            </Heading>
          </Flex>
        </Flex>
        {/* Download Section */}
        <Flex
          mx='5px'
          mt={['-10px', '-30px']}
          bgColor='#1E1F24'
          flexDir='column'
          alignItems='center'
          pos='relative'
        >
          <Flex
            maxW='container.xl'
            pt={['25px', null, '100px']}
            flexDir='column'
            justifyContent='center'
            h='100%'
          >
            <Flex 
              flexDir={['column', 'column', 'row']} 
              justifyContent='space-between' 
              alignItems={['center', null, 'initial']}
              pb={['0px', null, '60px']}
              h='100%'
            >
              <Box
                borderRadius={['5px', null, '20px']}
                overflow='hidden'
                w={['container.xs', null, '50%']}
                position='relative'
                h={['300px', null, 'initial']}
              >          
                <Image
                  alt='extension'
                  src='/media/Features_Image_1.png'
                  objectFit='cover'
                  layout='fill'
                />
              </Box>
              <Box p={['20px', null, '60px']}>
                <Heading
                  fontSize={['23px', null, '45px']}
                  lineHeight={['23.75px', null, '42.75px']}
                >
                  Chrome Extension
                </Heading>
                <Text
                  mt={['14px', null, '10px']}
                  fontSize={['14px', null, '18px']}
                  lineHeight={['19.6px', null, '25.2px']}
                >
                  One-click to become your hologram on Google Meet, Discord web, Gather, and any website with webcam.
                </Text>
                <Button
                  mt={['16px', null, '20px']}
                  variant='solid'
                  bgColor='#DCED71'
                  leftIcon={
                    <Image alt='google' src='/media/google-icon.svg' width='13.75px' height='14.17px' />
                  }
                  onClick={() => {
                    window.open('https://chrome.google.com/webstore/detail/hologram/oohijphjhalglmadbknnangmaelnncjd', '_blank');
                  }}
                >
                  Download
                </Button>
              </Box>
            </Flex>
            <Divider display={['none', 'none', 'initial']} />
            <Flex 
              flexDir={['column', 'column', 'row']} 
              justifyContent='space-between'
              alignItems={['center', null, 'initial']}
              pt={['0px', null, '60px']}
              pb={['35px', null, '100px']}
            >
              <Box
                borderRadius={['5px', null, '20px']}
                overflow='hidden'
                w={['container.xs', null, '50%']}
                position='relative'
                h={['300px', null, 'initial']}
              >
                <Image
                  alt='desktop'
                  src='/desktop.png'
                  objectFit='cover'
                  layout='fill'
                />
              </Box>
              <Box p={['20px', null, '60px']}>
                <Heading
                  fontSize={['23px', null, '45px']}
                  lineHeight={['23.75px', null, '42.75px']}
                >
                  Desktop Studio
                </Heading>
                <Text
                  mt={['14px', null, '10px']}
                  fontSize={['14px', null, '18px']}
                  lineHeight={['19.6px', null, '25.2px']}
                >
                  NFT-powered content creation studio. Video-chat anywhere, stream, and record video as your hologram.
                </Text>
                <Flex flexDir={['column', 'row']}>
                  <span>
                    <Button
                      mt={['16px', null, '20px']}
                      variant='solid'
                      bgColor='#DCED71'
                      leftIcon={
                        <Image alt='apple' src='/media/apple-icon.svg' width='13.75px' height='14.17px' />
                      }
                      onClick={() => setMacDownloadOpen(true)}
                    >
                      Download for Mac
                    </Button>
                  </span>
                  <span>
                    <Button
                      variant='solid'
                      ml={['0px', '19px']}
                      mt={['16px', null, '20px']}
                      bgColor='#DCED71'
                      leftIcon={
                        <Image alt='windows' src='/media/windows-icon.svg' width='13.75px' height='14.17px' />
                      }
                      _hover={{
                        color: 'black'
                      }}
                      onClick={() => {
                        window.location.href = config.web.download.windows;
                      }}
                    >
                        Download for PC
                    </Button>
                  </span>
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </Flex>
        <FooterBanner />
        <MacDownload isOpen={macDownloadOpen} onClose={() => setMacDownloadOpen(false)} />
      </Flex>
    </Box>
  );
};

export default Download;