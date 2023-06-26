import Image from 'next/image';
import Link from 'next/link';
import { Box } from '@chakra-ui/react';

const logoURL = {
  white: '/media/Logo-Hologram-White.svg',
  black: '/media/Logo-Hologram-Black.svg',
  brand: '/media/Logo-Hologram-FullColor.svg',
}

const Logo = ({ color }) => {
  let logo = logoURL.white;
  if (color === 'black') {
    logo = logoURL.black;
  } else if (color === 'brand') {
    logo = logoURL.brand;
  }
  return (
    <Box
      _hover={{ cursor: 'pointer' }}
      pos='relative'
      w={['196px', null, '200px']}
      h={['18px', null, '45px']}
    >
      <Link href='/' passHref>
        <Image 
          src={logo} 
          layout='fill'
          objectFit='contain'
          alt='logo'
        />
      </Link>
    </Box>
  );
};

export default Logo;