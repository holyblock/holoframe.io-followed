import type { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { Box, Button, Container, Grid, GridItem, Flex, Heading, Text, Link } from '@chakra-ui/react';

import { faceKey } from '../../settings';
import previewAssetURIs from '../utils/previewAssetURIs.json'; 
const StudioComponent: any = dynamic(() => import('../components/HologramStudio'), {
  ssr: false
})

const Home: NextPage = () => {
  return (
    <>
      <NextSeo
        title='Hologram - Your Portal to the Metaverse'
        description='Hologram lets you chat and stream as your virtual characters on any video platform.'
        openGraph={{
          title: 'Hologram - Become your main character',
          description: 'Hologram lets you chat and stream as your virtual characters on any video platform.',
          images: [
            {
              url: '/opengraph.png',
              alt: 'Hologram'
            }
          ]
        }}
      />
      <Flex flexDir='column'>
        <Box w='100%'>
          <Container
            display='flex'
            alignItems='center'
            flexDir='column'
            pt={['1rem', '65px']}
            minH={['60vh', '60vh', '860px']}
            maxW={['container.xl', 'container.lg', 'container.sm']}
            textAlign='center'
          >
            <Heading 
              as='h1' 
              size='4xl' 
              fontSize={['48px', '48px', '72px']}
            >
              Portal to the
            </Heading>
            <Heading
              as='h1' 
              size='4xl' 
              fontSize={['48px', '48px', '72px']}
              mb='40px'
              bgGradient='linear(to-b, #C22CF6, #7AE9E9)'
              bgClip='text'
            >
              Metaverse
            </Heading>
            <Text 
              fontSize='lg'
              fontWeight='medium'
              mb='40px'
            >
              Bring your NFTs to life. Use them to video-chat or stream on any social, gaming, or conferencing platform.
            </Text>
            <Flex mb='80px'>
              <Link href='/download' _hover={{ textDecor: 'none' }}>
                <Button
                  variant='outline'
                  mr='19px'
                  width='150px'
                  boxShadow='8px 8px #5D5FEF'
                >
                  Download
                </Button>
              </Link>
              <Button
                variant='outline'
                ml='19px'
                width='150px'
                boxShadow='8px 8px #5D5FEF'
                onClick={() => {
                  window.open('https://discord.gg/dEGAwss3Et', '_blank');
                }}
              >
                Discord
              </Button>
            </Flex>
            <Box 
              display={['none', 'initial', 'initial']}
              onClick={() => {
                window.open(
                  'https://opensea.io/assets/0xec41b998515839d0c1f048857ef90cf6f96ff10d/5',
                  '_blank'
                )
              }}
              _hover={{
                cursor: 'pointer'
              }}
            >
              <StudioComponent 
                apiKey={faceKey!}
                nftMetadataList={previewAssetURIs} 
                trackingMode={'mouse'}
                disableBannerKey='rollingtech21'
              />
            </Box>
          </Container>
        </Box>
        <Box w='100%' bg='black'>
          <Container
            display='flex'
            alignItems='center'
            flexDir='column'
            py={['80px', '80px', '145px']}
            maxW='container.lg'
            w='100%'
            textAlign='center'
          >
            <Heading 
              as='h1' 
              size='2xl' 
              mb='40px'
              color='white'
            >
              Web3 self-expression engine.
            </Heading>
            <Grid 
              templateColumns={['repeat(1, 1fr)', 'repeat(1, 1fr)', 'repeat(1, 1fr)', 'repeat(2, 1fr)']}
              gap='44px' 
              py={['20px', '40px', '80px']}
            >
              <GridItem textAlign='left' w='100vw' maxW='min(425px, 100vw)' px={['20px', '0px', '0px']}>
                <Text 
                  fontSize={['xl', 'xl', '2xl']} 
                  fontWeight='extrabold' 
                  color='white'
                  mb='10px'
                >
                  🎭 Anonymity over Video.
                </Text>
                <Text color='white'>
                  Chat or stream anonymously as voice-modulated virtual characters. You can finally turn on your webcam, anon.
                </Text>
              </GridItem>
              <GridItem textAlign='left' w='100vw' maxW='min(425px, 100vw)' px={['20px', '0px', '0px']}>
                <Text 
                  fontSize={['xl', 'xl', '2xl']} 
                  fontWeight='extrabold' 
                  color='white'
                  mb='10px'
                >
                  👾 Self-expression composability.
                </Text>
                <Text color='white'>
                  Mint live2D, glTF, and VRM-based avatars as NFTs and seamlessly use on Hologram and other metaverse platforms.              </Text>
              </GridItem>
              <GridItem textAlign='left' w='100vw' maxW='min(425px, 100vw)' px={['20px', '0px', '0px']}>
                <Text 
                  fontSize={['xl', 'xl', '2xl']} 
                  fontWeight='extrabold' 
                  color='white'
                  mb='10px'
                >
                  🖼 Artist-first.
                </Text>
                <Text color='white'>
                  Discover and work with talented live2D / 3D character artists. Your brand or community deserves the most personalized and stylized art for your characters.
                </Text>
              </GridItem>
              <GridItem textAlign='left' w='100vw' maxW='min(425px, 100vw)' px={['20px', '0px', '0px']}>
                <Text 
                  fontSize={['xl', 'xl', '2xl']} 
                  fontWeight='extrabold' 
                  color='white'
                  mb='10px'
                >
                  🎨 More upside for creators.
                </Text>
                <Text color='white'>
                  We partner with character artists and drop creators, who receive majority of primary sales and a cut of all secondary sales from their Hologram drops.
                </Text>
              </GridItem>
              <GridItem textAlign='left' w='100vw' maxW='min(425px, 100vw)' px={['20px', '0px', '0px']}>
                <Text 
                  fontSize={['xl', 'xl', '2xl']} 
                  fontWeight='extrabold' 
                  color='white'
                  mb='10px'
                >
                  🛠 NFTs with utility.
                </Text>
                <Text color='white'>
                  Hologram’s NFT creation framework ushers in a new era of drops in which utility and expressivity are the norm, not the exception.
                </Text>
              </GridItem>
              <GridItem textAlign='left' w='100vw' maxW='min(425px, 100vw)' px={['20px', '0px', '0px']}>
                <Text 
                  fontSize={['xl', 'xl', '2xl']} 
                  fontWeight='extrabold' 
                  color='white'
                  mb='10px'
                >
                  ✅ Realtime identity verification.
                </Text>
                <Text color='white'>
                  Hologram leverages NFT ownership, on-chain data, and cryptographic proofs to verify that those on video are who they claim to be.
                </Text>
              </GridItem>
            </Grid>
          </Container>
        </Box>
        <Box w='100%' bgGradient='linear(to-r, #C22CF6, #5D5FEF90, #7AE9E9)'>
          <Container
            display='flex'
            justifyContent='center'
            alignItems='center'
            flexDir='column'
            py={['80px', '80px', '145px']}
            mb={['160px', '0px', '0px']}
            maxW='container.lg'
            textAlign='center'
          >
            <Heading 
              as='h1' 
              size='2xl' 
              mb='60px'
              color='white'
            >
              Get Early Access
            </Heading>
            <Flex flexDir={['column', 'column', 'row']}>
              <Button
                variant='outline'
                mr={['0px', '0x', '19px']}
                mb={['19px', '19px', '0px']}
                w='200px'
                h='60px'
                color='white'
                borderWidth='4px'
                borderColor='white'
                bgGradient='linear(to-b, #2B2DEE80, #5D5FEF80, #C22CF680)'
                _hover={{ bgGradient: 'linear(to-b, #2B2DEE, #5D5FEF, #C22CF6)' }}
                onClick={() => {
                  window.open('https://96qj09fgwg6.typeform.com/to/oWQqHczU', '_blank');
                }}
              >
                Get an Avatar
              </Button>
              <Button
                variant='outline'
                ml={['0px', '0x', '19px']}
                w='200px'
                h='60px'
                color='white'
                borderWidth='4px'
                borderColor='white'
                bgColor='#63959580'
                _hover={{ bgColor: '#639595'}}
                onClick={() => {
                  window.open('https://96qj09fgwg6.typeform.com/to/bwPU4PxJ', '_blank');
                }}
              >
                Create a Drop
              </Button>
            </Flex>
          </Container>
        </Box>
      </Flex>
    </>
  )
}

export default Home
