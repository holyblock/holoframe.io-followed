import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Image,
  Menu,
  MenuButton,
  HStack,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSwitchNetwork } from 'wagmi';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import { colors } from '../../../styles/theme';

import ConnectWallet from '../../Modal/ConnectWallet';
import { useAuth } from '../../../contexts/AuthContext';
import { WalletIcon } from '../../Icons/WalletIcon';
import { ShirtIcon } from '@/components/Icons/ShirtIcon';
import { VideoIcon } from '@/components/Icons/VideoIcon';

const AppNavigationBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chainId, address, isAuthenticated, logout } = useAuth();
  const { switchNetwork } = useSwitchNetwork();
  const router = useRouter();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Flex
      top={0}
      position="fixed"
      height="72px"
      width="100%"
      alignItems="center"
      px="18px"
      zIndex={10}
      background="rgba(0, 198, 198, 0.02)"
      boxShadow="0px 4px 17px 2px rgba(0, 91, 75, 0.09)"
      borderBottom="1px solid rgba(160, 238, 123, 0.15)"
      justifyContent="space-between"
    >
      <Box _hover={{ cursor: 'pointer' }}>
        <Link href="https://hologram.xyz" target="_blank" passHref>
          <Image src="/app-logo.svg" alt="hologram" height="25px" />
        </Link>
      </Box>
      <HStack gap="42.33px">
        <HStack
          _hover={{ cursor: 'pointer' }}
          onClick={() => router.replace('/')}
        >
          <ShirtIcon
            color={router.pathname === '/' ? 'white' : '#CBF6FF'}
            w="29px"
            h="22px"
            fill='rgba(0, 198, 198, 0.02)'
          />
          <Text
            color={router.pathname === '/' ? 'white' : '#CBF6FF'}
            fontFamily="PPMonumentExtended"
            fontSize="16px"
            fontWeight="600"
          >
            WARDROBE
          </Text>
        </HStack>
        <HStack
          _hover={{ cursor: 'pointer' }}
          onClick={() => router.replace('/studio')}
        >
          <VideoIcon
            color={router.pathname === '/studio' ? 'white' : '#CBF6FF'}
            w="27px"
            h="17px"
          />
          <Text
            color={router.pathname === '/studio' ? 'white' : '#CBF6FF'}
            fontFamily="PPMonumentExtended"
            fontSize="16px"
            fontWeight="600"
          >
            STUDIO
          </Text>
        </HStack>
      </HStack>
      <Flex>
        <ButtonGroup
          alignItems="center"
          textAlign="center"
          size="sm"
          spacing={10}
          display="flex"
        >
          {!isConnected ? (
            <button
              className="flex items-center px-4 py-3 text-xs font-bold uppercase bg-white rounded-full gap-1"
              onClick={onOpen}
            >
              Connect Wallet
              <WalletIcon />
            </button>
          ) : (
            <Menu>
              <MenuButton className="px-4 py-3 text-xs font-bold uppercase bg-white rounded-full">
                {`${address?.slice(0, 4)}...${address?.slice(38)}`}
              </MenuButton>
              <MenuList>
                {isConnected && chainId !== 1 && (
                  <MenuItem
                    className="text-xs"
                    color="black"
                    onClick={() => switchNetwork!(1)}
                  >
                    Switch to Mainnet
                  </MenuItem>
                )}
                <MenuItem className="text-xs" color="black" onClick={logout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </ButtonGroup>
      </Flex>
      <ConnectWallet isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};

export default AppNavigationBar;
