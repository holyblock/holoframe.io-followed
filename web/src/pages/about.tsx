import { Button, Flex, Heading, Text, Grid, SimpleGrid, Box } from '@chakra-ui/react';
import NavigationBar from '../components/NavigationBar';
import SectionLabel from '../components/Label/SectionLabel';
import Image from 'next/image';
import FooterBanner from '../components/NavigationFooter/FooterBanner';

const About = () => {
  return (
    <Flex flexDir='column' bg="white">
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
          pb={['50px', '100px']}
        >
          <SectionLabel
            text='About Us'
            bgColor='rgba(255,255,255,0.2)'
          />
          <Heading 
            maxW='container.lg'
            textAlign='center'
            color='white'
            pt={['8px', '20px']}
            fontWeight='700'
            fontSize={['30px', '65px']}
            lineHeight={['29.7px', '64.35px']}
          >
            Building the future of {' '}
            <span style={{ color: '#E6F29B' }}>
              digital identity 
            </span>
            {' '} and {' '}
            <span style={{ color: '#E6F29B' }}>
              self expression
            </span> in the open metaverse.
          </Heading>
          <Flex
            justifyContent='center'
            pt='35px'
            w='100%'
          >
            <Button
              variant='solid'
              bgColor='#DCED71'
              width={['152px', '180px']}
              h='45px'
              onClick={() => {
                window.open('https://docs.hologram.xyz/resources/manifesto')
              }}
              mr='10px'
            >
              Manifesto
            </Button>
            <Button
              variant='solid'
              bgColor='#DCED71'
              width={['152px', '180px']}
              h='45px'
              onClick={() => {
                window.open(
                  'https://hologramxyz.notion.site/Work-with-Hologram-8c0f5ee8b8d54609b4675cdca610172d', 
                  '_blank'
                );
              }}
              ml='10px'
            >
              Join Us
            </Button>
          </Flex>
          {/* <Box h='500px' /> */}
        </Flex>
      </Flex>
      {/* Investors */}
      <Flex
        mx='5px'
        mt={['-10px', '-30px']}
        bgColor='#1E1F24'
        flexDir='column'
        alignItems='center'
        pos='relative'
      >
        <Flex
          maxW={['container.xs', 'container.sm', 'container.md', 'container.xl']}
          flexDir='column'
          alignItems='center'
          pt={['30px', '60px', '100px', '150px']}
        >
          <SectionLabel
            text='Investors'
            bgColor='rgba(255,255,255,0.2)'
          />
          <Heading 
            textAlign='center'
            color='white'
            pt={['8px', '20px']}
            fontWeight='700'
            fontSize={['30px', '65px']}
            lineHeight={['29.7px', '64.35px']}
          >
            Backed by {' '}
            <span style={{ color: '#E6F29B' }}>
              industry leaders
            </span>
          </Heading>
        </Flex>
        <SimpleGrid
          maxW={['container.xs', 'container.lg']}
          columns={[2, 3, null, 4]}
          pt={['40px', '80px']}
          pos='relative'
          spacingX={['20px', '60px', '100px']}
          spacingY={['20px', null, null, '50px']}
          minH={['400px', null, null, '250px']}
        >
          <Box
            bgImg='url(/media/investors/polychain.svg)'
            bgRepeat='no-repeat'
            bgSize='80%'
            bgPos='center'
            width={['150px', null, null, '200px']}
          />
          <Box
            bgImg='url(/media/investors/nascent.svg)'
            bgRepeat='no-repeat'
            bgSize='100%'
            bgPos='center'
          />
          <Box
            bgImg='url(/media/investors/inflection.svg)'
            bgRepeat='no-repeat'
            bgPos='center'
            bgSize='100%'
          />
          <Box
            bgImg='url(/media/investors/foothill.svg)'
            bgRepeat='no-repeat'
            bgSize='100%'
            bgPos='center'
          />
          <Box
            bgImg='url(/media/investors/quantstamp.svg)'
            h='100%'
            w='100%'
            bgRepeat='no-repeat'
            bgSize='100%'
            bgPos='center'
          />
          <Box
            bgImg='url(/media/investors/arweave.svg)'
            bgRepeat='no-repeat'
            bgPos='center'
            bgSize='100%'
          />
          <Box
            bgImg='url(/media/investors/yat.svg)'
            bgRepeat='no-repeat'
            bgPos='center'
            bgSize='60%'
          />
          <Box
            bgImg='url(/media/investors/spc.svg)'
            bgRepeat='no-repeat'
            bgPos='center'
            bgSize='100%'
          />
        </SimpleGrid>
        <Heading 
          textAlign='center'
          color='white'
          pt={['40px', '80px']}
          fontWeight='700'
          fontSize={['21px', '30px']}
        >
          Angel Investors
        </Heading>
        <SimpleGrid
          maxW={['container.xs', 'container.lg']}
          columns={[3, null, null, 5]}
          pt={['40px', '80px']}
          pb={['60px', '120px']}
          pos='relative'
          columnGap={['20px', '50px', '50px']}
          rowGap={['30px', null, null, '50px']}
          textAlign='center'
          alignItems='center'
        >
          <Text>
            Mike Shinoda
          </Text>
          <Text>
            Ken Cron
          </Text>
          <Text>
            Kalos
          </Text>
          <Text>
            DCF God
          </Text>
          <Text>
            Palmer
          </Text>
          <Text>
            Cozy
          </Text>
          <Text>
            Sam Williams
          </Text>
          <Text>
            Sam Sends
          </Text>
          <Text>
            Eric Witschen
          </Text>
          <Text>
            Richard Ma
          </Text>
          <Text>
            Don Ho
          </Text>
          <Text>
            Jimmy Xue
          </Text>
          <Text>
            Marc Weinstein
          </Text>
          <Text>
            Osama Khan
          </Text>
          <Text>
            Joe Greenstein
          </Text>
          <Text>
            Srinivas Narayanan
          </Text>
          <Text>
            Julian Gay
          </Text>
          <Text>
            Jonathan Mak
          </Text>
          <Text>
            Nop Jiarathanakul
          </Text>
          <Text>
            and more...
          </Text>
        </SimpleGrid>
      </Flex>
      <FooterBanner />
    </Flex>
  );
};

export default About;