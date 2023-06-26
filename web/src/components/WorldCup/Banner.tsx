import React from 'react';
import { Box, Button, ButtonGroup, Flex, Heading } from '@chakra-ui/react';
import { colors } from '../../styles/theme';

interface BannerProps {
  aboutRef: React.RefObject<HTMLDivElement>;
  mintRef: React.RefObject<HTMLDivElement>;
  playRef: React.RefObject<HTMLDivElement>;
  faqsRef: React.RefObject<HTMLDivElement>;
};

const BANNER_URL = "https://hologramxyz.s3.amazonaws.com/assets/banners/holo-wc-3.png";

const Banner = (props: BannerProps) => {
  const {
    aboutRef,
    mintRef,
    playRef,
    faqsRef
  } = props;

  return (
    <Box>
      <Flex
        background={`linear-gradient(180deg, rgba(0, 0, 0, 0) 20.42%, ${colors.brand.secondary} 100%), url(${BANNER_URL})`}
        bgColor={colors.brand.secondary}
        bgPos="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        justifyContent="center"
        alignItems="center"
        minW="100vw"
        minH="100vh"
        mb={7}
      >
        <Heading
          as="h1"
          fontSize={["48px", "64px", "80px"]}
          textAlign="center"
        >
          Hologram World Cup Drop
        </Heading>
      </Flex>
      <Flex
        justifyContent="center"
        pt="30px"
        pb="30px"
      >
        <ButtonGroup spacing="40px">
          <Button
            fontSize="20px"
            textTransform="capitalize"
            color='white'
            variant='link'
            letterSpacing="wider"
            _focus={{ boxShadow: "none" }}
            onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            About
          </Button>
          <Button
            fontSize="20px"
            textTransform="capitalize"
            color='white'
            variant='link'
            letterSpacing="wider"
            _focus={{ boxShadow: "none" }}
            onClick={() => mintRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            Mint
          </Button>
          <Button
            fontSize="20px"
            textTransform="capitalize"
            color='white'
            variant='link'
            letterSpacing="wider"
            _focus={{ boxShadow: "none" }}
            onClick={() => playRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            Play
          </Button>
          <Button
            fontSize="20px"
            textTransform="capitalize"
            color='white'
            variant='link'
            letterSpacing="wider"
            _focus={{ boxShadow: "none" }}
            onClick={() => faqsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            FAQs
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};

export default Banner;