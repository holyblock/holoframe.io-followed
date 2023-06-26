import { useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { Box, Button, Container, IconButton, Fade, Flex, Heading, Text } from '@chakra-ui/react';
import { SiDiscord, SiTwitter } from 'react-icons/si';

import useIntersection from '../hooks/useIntersection';
import TextBanner from '../components/Animated/TextBanner';
import { faceKey } from '../../settings';
import previewAssetURIs from '../utils/previewAssetURIs.json'; 
import NavigationBar from '../components/NavigationBar';
import FooterBanner from '../components/NavigationFooter/FooterBanner';
import SectionLabel from '../components/Label/SectionLabel';
import PartnerBanner from '../components/Banner/PartnerBanner';
import ProductBanner from '../components/Banner/ProductBanner';
import { colors } from '../styles/theme';
const StudioComponent: any = dynamic(() => import('../components/HologramStudio'), {
  ssr: false
})

const Landing = () => {
  const studioRef = useRef<any>();
  const studioInView = useIntersection(studioRef, '0px');

  return (
    <Box bg='white'>
      <Fade in={true}>
        <NextSeo
          title='Hologram - Become your digital self'
          description='Immerse as your virtual characters, connect with others, and create unforgettable moments on any video and gaming platform.'
          openGraph={{
            title: 'Hologram - Become your digital self',
            description: 'Immerse as your virtual characters, connect with others, and create unforgettable moments on any video and gaming platform.',
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
          >
            {/* Nav bar */}
            <NavigationBar studioRef={studioRef} />
            {/* Heading */}
            <Container
              w='100%'
              maxW='container.lg'
            >
              <Heading 
                as='h1'
                color='white'
                pt={['42px', '56px', '68px', '80px']}
                fontSize={['40px', '65px', '80px', '95px']}
                lineHeight={['34.8px', '60px', '82.65px']}
                letterSpacing={['0.015em', '1.5%']}
                textAlign='center'
                fontWeight='700'
              >
                Become your
                <Box color='#E6F29B'>digital self</Box>
              </Heading>
              <Text pt={['24px', '28px']} textAlign='center' fontSize='16px' fontWeight='300'>
                Bring your brand or community to life. Create unforgettable moments with others on any social, gaming, or content platform.
              </Text> 
              <Box
                display={['flex', 'flex', 'none']}
                justifyContent={['center', null, null, 'space-around']}
                pt='24px'
                pb={['48px', '0px']}
                w='100%'
              >
                <Button
                  display={['none', 'initial', 'initial']}
                  variant='outline'
                  width={['152px', '180px']}
                  mr={[2, null, null, 0]}
                  h='45px'
                  onClick={() => studioRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Try Hologram
                </Button>
                <Button
                  mr={[2, null, null, 0]}
                  aria-label='twitter'
                  h='45px'     
                  variant='outline'
                  onClick={() => {
                    window.open('https://twitter.com/hologramlabs', '_blank');
                  }}
                  leftIcon={
                    <SiTwitter size={15} />
                  }
                  _hover={{
                    bgColor: 'initial',
                    color: colors.brand.primary,
                    borderColor: colors.brand.primary
                  }}
                >
                  Twitter
                </Button>
                <Button
                  mr={[2, null, null, 0]}
                  aria-label='twitter'
                  h='45px'
                  variant='outline'
                  onClick={() => {
                    window.open('https://discord.gg/hc5MzksMTH', '_blank');
                  }}
                  leftIcon={
                    <SiDiscord size={15} />
                  }
                  _hover={{
                    bgColor: 'initial',
                    color: colors.brand.primary,
                    borderColor: colors.brand.primary
                  }}
                >
                  Discord
                </Button>
              </Box>
              <Flex
                display={['none', 'none', 'flex']}
                justifyContent='center'
                alignItems='center'
                h={['160px', '300px', '400px', '500px']}
                mt={['40px', null, '35px', '0px']}
                pos='relative'
              >
                <Image
                  src='/media/Hero_Image.png'
                  layout='fill'
                  objectFit='cover'
                  alt='video-graphic'
                />
                <Box mt={['20px', null, '0x', '110px']}>
                  { !studioInView &&
                    <StudioComponent 
                      apiKey={faceKey!}
                      nftMetadataList={previewAssetURIs}
                      trackingMode='mouse'
                      disableBannerKey='rollingtech21'
                      size='md'
                    />
                  }
                </Box>
              </Flex>
            </Container>
          </Flex>
          {/* Partner Banner */}
          <Flex
            mx='5px'
            mt={['-10px', '-30px']}
            bgColor='#1E1F24'
            flexDir='column'
            alignItems='center'
            pos='relative'
          >
            <TextBanner heading='THE SELF-EXPRESSION COMPANY'/>
            <Flex 
              maxW={['container.sm', 'container.md', 'container.lg', 'container.xl']}
              justifyContent='center'
              alignItems='center' 
              flexDir='column' 
              pt={['40px', '74px']}
            >
              <SectionLabel
                text='Welcome'
                bgColor='rgba(255,255,255,0.2)'
              />
              <Heading 
                textAlign='center' 
                fontSize={['30px', '65px']}
                color='white'
                pt={['8px', '20px']}
                lineHeight={['29.7px', '64.35px']}
              >
                We bring {' '}
                <span style={{ color: '#E6F29B' }}>
                  online communities
                </span>
                {' '}to life.
              </Heading>
              <Text pt={['20px', '42px']} fontSize={['14px', '16px']}>
                Our Partner Communities
              </Text>
              <Box pt='10px'>
                <Image alt='globe' src='/media/globe.svg' width='30px' height='22px' />
              </Box>
            </Flex>
            <PartnerBanner />
            {/* <Button
              variant='solid'
              bgColor='#DCED71'
              position='absolute'
              bottom='70px'
              onClick={() => {
                window.open('https://hologramlabs.typeform.com/early-access', '_blank');
              }}
            >
              Sign up for Early Access
            </Button> */}
          </Flex>
          {/* Feature Banner */}
          <Flex
            flexDir='column'
            bgColor='#34414B'
            bgImage='url("/media/grain.svg")'
            mx='5px'
            mt='-20px'
            borderRadius={['5px', '20px']}
            alignItems='center'
            zIndex={99}
          >
            <Flex
              maxW={['container.xs', 'container.sm', 'container.md',  'container.lg', 'container.xl']}
              flexDir='column'
              alignItems={['center', null, null, 'start']}
              pt={['40px', null, '100px', '150px']}
            >
              <SectionLabel
                text='Features'
                bgColor='rgba(255,255,255,0.2)'
              />
              <Heading 
                textAlign={['center', null, null, 'left']}
                color='white'
                pt={['8px', '20px']}
                fontWeight='700'
                fontSize={['30px', '65px']}
                lineHeight={['29.7px', '64.35px']}
              >
                The hub for your {' '}
                <span style={{ color: '#E6F29B' }}>
                  virtual experiences
                </span>.
              </Heading>
            </Flex>
            <Box mt={['25px', '62px']} zIndex={97}>
              <ProductBanner
                title='One-click, anywhere.'
                description='Start video-calls or livestreams, create content, and join virtual spaces as motion-tracked characters with one click on any device.'
                bgColor='#4990A8'
                imageURL='/media/Features_Image_1.png'
              />
            </Box>
            <Box mt={['25px', null, null, '-100px']} zIndex={98}>
              <ProductBanner
                title='Creativity at scale.'
                description='Your brand or community deserves personalized art, not generic templates. Hologram empowers any artists to create expressive characters, wearables, and more for you or your 10K+ community.'
                bgColor='#625086'
                imageURL='/media/Features_Image_2.png'
              />
            </Box>
            <Box mt={['25px', null, null, '-100px']} mb={['22.5px', '150px']} zIndex={99}>
              <ProductBanner
                title='Entirely new experiences.'
                description='Discover and trade virtual items to upgrade your holograms, which you can use in virtual hangouts, community events, 3D worlds, and anywhere you can imagine.'
                bgColor='#6570D7'
                imageURL='/media/Features_Image_3.png'
              />
            </Box>
          </Flex>
          {/* 1-of-1 Holograms Banner */}
          <Flex
            bgColor='#1E1F24'
            flexDir='column'
            alignItems='center'
            mx='5px'
            mt='-30px'
            borderRadius={['5px', '20px']}
            // maxW={['container.xs', 'container.sm', 'container.md', 'container.xl']}
          >
            <Flex
              maxW={['container.xs', 'container.sm', 'container.md', 'container.xl']}
              flexDir='column'
              alignItems='center'
              pt={['70px', null, '100px', '150px']}
            >
              <SectionLabel
                text='Early Access'
                bgColor='rgba(255,255,255,0.2)'
              />
              <Heading 
                textAlign={['center', null, null, 'left']}
                color='white'
                pt={['8px', '20px']}
                fontWeight='700'
                fontSize={['30px', '65px']}
                lineHeight={['29.7px', '64.35px']}
              >
                Bring your {' '}
                <span style={{ color: '#E6F29B'}}>
                  brand
                </span>
                {' '}to life.
              </Heading>
            </Flex>    
            <Flex
              maxW={['container.xs', 'container.xl']}
              borderRadius={['5px', '25px']}
              mt={['25px', null, null, '120px']}
              mb={['22.5px', null, null, '150px']}
              pb={['50px', null, null, '25px']}
              pl={['20px', null, '50px', '110px']}
              pr={['20px', null, '50px', '56px']}
              alignItems='center'
              justifyContent='space-between'
              flexDir={['column', null, 'column', 'row']}
            >
              <Box
                overflow='hidden'
                borderRadius={['5px', '20px']}
                pos='relative'
                minW={['265px', null, null, '600px']}
              >
                <video 
                  src='https://hologramxyz.s3.amazonaws.com/media/Features_Video_1.mp4' 
                  muted
                  autoPlay
                  loop
                />
              </Box>
              <Flex
                mt={['25px', null, null, '0px']}
                ml={['0px', null, null, '152px']}
                flexDir='column'
              >
                <Heading lineHeight={['23.75px', '42.75px']} color='white' fontSize={['25px', '45px']}>
                  1-1 custom holograms
                </Heading>
                <Text lineHeight={['19.6px', '25.2px']} mt={['14px', '22px']} color='white' fontSize={['14px', '18px']}>
                  Already have an idea in mind for your character or Vtuber? Jump into our Discord and share what you have in mind!
                </Text>
                <Button
                  variant='outline'
                  mt='28px'
                  marginRight='auto'
                  onClick={() => {
                    window.open('https://discord.gg/hc5MzksMTH', '_blank');
                  }}
                >
                  Join Community
                </Button>
              </Flex>
            </Flex> 
          </Flex>
          {/* Studio Demo */}
          <Flex
            display={['none', 'inherit', 'inherit']}
            bgColor='white'
            py={['40px', null, '50px', '90px']}
            flexDir='column'
            alignItems='center'
            mx='5px'
            borderRadius={['5px', '20px']}
            zIndex={99}
            minH={['450px', '1000px']}
            ref={studioRef}
          >
            <SectionLabel
              text='Studio Mode'
              bgColor='rgba(0,0,0,0.2)'
              color='black'
            />
            <Heading
              maxW={['container.xs', 'container.sm', 'container.md', 'container.xl']}
              textAlign='center' 
              fontWeight='700'
              fontSize={['30px', '65px']}
              py='17px'
              color='#222329'
              lineHeight={['29.7px', '64.35px']}
            >
              See Hologram in action
            </Heading>
            { studioInView &&
              <StudioComponent 
                apiKey={faceKey!}
                nftMetadataList={previewAssetURIs}
                toolbarEnabled
                uploadEnabled
                trackingMode='face'
                selectDisplayMode='grid'
                disableBannerKey='rollingtech21'
              />
            }
          </Flex>
          {/* Footer */}
          <FooterBanner />
          {/* <Footer /> */}
        </Flex>
      </Fade>
    </Box>
  );
};

export default Landing;
