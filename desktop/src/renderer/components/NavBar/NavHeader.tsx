import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from 'renderer/contexts/AuthContext';
import { Button, Flex, Heading, Link } from '@chakra-ui/react';
import MainMenu from '../Menu';
import ConnectWallet from '../Modal/ConnectWallet';
import { colors } from 'renderer/styles/theme';

const NavHeader = () => {
  const { userAddress } = useAuth();
  const [title, setTitle] = useState('Hologram');
  const [connectWalletOpen, setConnectWalletOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      setTitle('Collectibles');
    } else if (location.pathname === '/studio') {
      setTitle('Studio');
    } else if (location.pathname === '/voice') {
      setTitle('My Voice');
    } else if (location.pathname === '/settings') {
      setTitle('Settings');
    } else if (location.pathname === '/login') {
      setTitle('Login');
    }
  }, [location]);

  return (
    <Flex
      as="nav"
      h="55px"
      marginBottom="0"
      alignItems="center"
      justifyContent="center"
      w="100%"
      mb={6}
      zIndex={98}
    >
      <MainMenu />
      <Link
        mt={2}
        href="https://hologram.xyz"
        isExternal
        _hover={{ textDecor: 'none' }}
      >
        <Heading size="lg" textAlign="center">
          {title ?? 'Hologram'}
        </Heading>
      </Link>
      <Button
        color="black"
        backgroundColor={colors.brand.primary}
        // outlineColor="white"
        variant="solid"
        // borderRadius="25px"
        py="6px"
        px="6px"
        height="35px"
        my="6px"
        mx="15px"
        onClick={() => setConnectWalletOpen(true)}
        position="fixed"
        right={2}
        top={2}
      >
        {userAddress
          ? `${userAddress?.slice(0, 4)}...${userAddress?.slice(38)}`
          : 'Connect'}
      </Button>
      <ConnectWallet
        isOpen={connectWalletOpen}
        onClose={() => setConnectWalletOpen(false)}
      />
    </Flex>
  );
};

export default NavHeader;
