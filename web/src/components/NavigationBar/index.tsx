import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button, IconButton, Flex } from '@chakra-ui/react';
import { SiDiscord, SiTwitter } from 'react-icons/si';
import Logo from '../../components/Logo';
import { colors } from '../../styles/theme';

interface NavigationBarProps {
  studioRef?: any
}

const NavigationBar = (props: NavigationBarProps) => {
  const router = useRouter();
  const { studioRef } = props;
  return (
    <Flex
      justifyContent={['center', 'center', 'space-between']}
      alignItems='center'
      px='44px'
      pt='36px'
    >
      <Button
        display={['none', 'none', 'initial']}
        variant='outline'
        width='180px'
        h='45px'
        onClick={() => {
          if (studioRef) {
            studioRef.current?.scrollIntoView({ behavior: 'smooth' })
          } else {
            router.push('/studio');
          }
        }}
      >
        Try Hologram
      </Button>
      <Logo color='white'/>
      <Flex
        display={['none', null, 'flex']}
        justifyContent='right'
        alignItems='center'
        w='180px'
        flexDir='row'
      >
        <IconButton
          mr={1}
          aria-label='twitter'
          h={['20px', null, '45px']}
          variant='ghost'
          onClick={() => {
            window.open('https://twitter.com/hologramlabs', '_blank');
          }}
          icon={
            <SiTwitter size={25} />
          }
          _hover={{
            bgColor: 'initial',
            color: colors.brand.primary,
          }}
        >
          Twitter
        </IconButton>
        <IconButton
          ml={1}
          aria-label='twitter'
          h='45px'
          variant='ghost'
          onClick={() => {
            window.open('https://discord.gg/hc5MzksMTH', '_blank');
          }}
          icon={
            <SiDiscord size={25} />
          }
          _hover={{
            bgColor: 'initial',
            color: colors.brand.primary,
          }}
        >
          Discord
        </IconButton>
      </Flex>
    </Flex>
  );
};

export default NavigationBar;