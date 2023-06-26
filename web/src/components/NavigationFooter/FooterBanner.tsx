import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Button, ButtonGroup, Link as ChakraLink, Heading, Flex } from '@chakra-ui/react';

import TextBanner from '../Animated/TextBanner';

const NavigationFooter = () => {
  return (
    <Flex
      flexDir='column'
      bgImage='url("/media/mask.svg"),url("/media/grain.svg"),url("/media/gradient-footer.svg")'
      bgPos='center'
      bgRepeat='no-repeat'
      bgSize='cover'
      borderRadius={['5px', '20px']}
      m='5px'
      mt={['-10px', '-30px']}
      pt={['10px', '0px']}
      position='relative'
      alignItems='center'
    >
      <TextBanner heading='THE SELF-EXPRESSION COMPANY'/>
      <Heading
        maxW={['container.xs', 'container.md', null, 'container.xl']}
        color='white' 
        pt={['154px',  '140px']}
        textAlign='center'
        fontSize={['45px', '70px', null, '110px']}
        fontWeight='700'
        lineHeight={['39px', '65px', null, '98px']}
      >
        Get{' '}<span style={{ color: '#E6F29B' }}>early access</span>{' '}today
      </Heading>
      <Link href='/download' passHref>
        <Button
          mt={['24px', '37px']}
          variant='outline'
          width='180px'
          h={['37px', '45px']}
        >
          Download Beta
        </Button>
      </Link>
      <ButtonGroup
        mt={['50px', null, '80px']}
        mb={['100px', null, '150px', '200px']}
        textAlign='center'
        size='sm'
        spacing={[0, null, 7]}
        display='flex'
        flexDir={['column', null,  'row']}
      >
        <ChakraLink href='/about'>
          <Button color='white' variant='link'>
            About
          </Button>
        </ChakraLink>
        <ChakraLink 
          href={'https://hologramxyz.notion.site/Work-with-Hologram-8c0f5ee8b8d54609b4675cdca610172d'} 
          isExternal
        >
          <Button color='white' variant='link'>
            Careers
          </Button>
        </ChakraLink>
        <ChakraLink href={'https://docs.hologram.xyz/'} isExternal>
          <Button color='white' variant='link'>
            Docs
          </Button>
        </ChakraLink>
        <ChakraLink href={'https://docs.hologram.xyz/resources/faqs'} isExternal>
          <Button color='white' variant='link'>
            FAQs
          </Button>
        </ChakraLink>
        <ChakraLink href={'https://hologram.canny.io/feature-requests'} isExternal>
          <Button color='white' variant='link'>
            Feedback
          </Button>
        </ChakraLink>
      </ButtonGroup>
      <Box
        pt={['50px', '70px', null, '160px']}
        bottom={['0px', '10px', null, '0px']}
        w={['92vw', null, null, '95vw']}
        pos='absolute'
      >
        <Image
          alt='logo-large'
          src='/media/Wordmark-Hologram-White.svg'
          layout='fill'
        />
      </Box>
    </Flex>
  );
};

export default NavigationFooter;
