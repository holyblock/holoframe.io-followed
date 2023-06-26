
import { useRouter } from 'next/router'
import Link from 'next/link';
import { 
  Box,
  Button,
  Container,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure
} from '@chakra-ui/react';
import { useSwitchNetwork, useNetwork } from 'wagmi';
import localforage from 'localforage';
import ConnectWallet from '../Modal/ConnectWallet';
import Logo from '../Logo';
import config from '../../../../utils/config';
import { useAuth } from '../../contexts/AuthContext';

const StudioNavigationBar = () => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const { address, isConnected, setTokenproofSession, logout } = useAuth();
  const showAccount = router.pathname === '/studio' || 
    router.pathname.includes('/creator')

  return (
    <>
      <Box bg='transparent' mx="auto" py={2} mb={4}>
        <Container maxW='container.lg'>
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <Logo color='black'/>
            <Box>
              <Button
                variant='link'
                mx='12px'
                onClick={() => {
                  window.open('https://docs.hologram.xyz', '_blank');
                }}
              >
                Docs
              </Button>
              { showAccount
                ?
                  <Box display={['none', 'initial', 'initial']}>
                    { !address
                      ?
                        <Button
                          variant='outline'
                          ml='12px'
                          color='black'
                          borderColor='black'
                          onClick={onOpen}
                          _hover={{
                            bgColor: 'black',
                            color: 'white'
                          }}
                          _active={{
                            bgColor: 'black',
                            color: 'white'
                          }}
                        >
                          Connect Wallet
                        </Button>
                      :
                        <Menu>
                          <MenuButton
                            as={Button}
                            variant="outline"
                            ml='12px'
                            color='black'
                            borderColor='black'
                            _hover={{
                              bgColor: 'black',
                              color: 'white'
                            }}
                            _active={{
                              bgColor: 'black',
                              color: 'white'
                            }}
                          >
                            {
                              `${address?.slice(0, 4)}...${address?.slice(38)}`
                            }
                          </MenuButton>
                          <MenuList>
                            { config.web.studio.whitelist.creators.includes(address!) &&
                              <Link passHref href='/creator/collections' >
                                <MenuItem color='black'>
                                  Creator studio (Beta)
                                </MenuItem>
                              </Link>
                            }
                            {isConnected && (
                              <MenuItem
                                color='black'
                                onClick={async () => {
                                  if (chain?.id === 1) {
                                    switchNetwork!(5);
                                  } else {
                                    switchNetwork!(1);
                                  }
                                }}
                              >
                                { 
                                  chain?.id === 1
                                    ? 'Switch to testnet'
                                    : 'Switch to mainnet'
                                }
                              </MenuItem>
                            )} 
                            <MenuItem
                              color='black'
                              onClick={async () => {
                                await logout();
                                setTokenproofSession?.(undefined);
                                await localforage.clear();
                                router.push('/studio'); // Navigate back to home page
                              }}
                            >
                              Logout
                            </MenuItem>
                          </MenuList>
                        </Menu>
                    }
                  </Box>
                :
                  <Box display={['none', 'initial', 'initial']}>
                    <Link href='/studio' passHref>
                      <Button
                        variant='outline'
                        ml='12px'
                        borderRadius='25px'
                      >
                        Enter Studio
                      </Button>
                    </Link>
                  </Box>
              }
            </Box>
          </Flex>
        </Container>
      </Box>
      <ConnectWallet isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default StudioNavigationBar;