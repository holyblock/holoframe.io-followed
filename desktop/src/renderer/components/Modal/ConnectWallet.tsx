import {
  Box,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Flex,
} from '@chakra-ui/react';
import { LockIcon, RepeatIcon } from '@chakra-ui/icons';
import localforage from 'localforage';
import { useAuth } from 'renderer/contexts/AuthContext';
import { useNFT } from 'renderer/contexts/NFTContext';
import Select, { StylesConfig, OptionProps } from 'react-select';

import { MULTICHAIN_OPTIONS } from 'renderer/config/web3Constants';
import walletConnectLogo from '../../../../assets/img/walletconnect.svg';
import tokenproofLogo from '../../../../assets/img/tokenproof.svg';
import metamaskLogo from '../../../../assets/img/metamask.svg';
import ethereumLogo from '../../../../assets/img/ethereum.svg';
import grainTexture from '../../../../assets/img/grain.svg';
import Button from '../Button';
import { colors } from '../../styles/theme';

interface ConnectWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

const IconOption = (props: OptionProps<any>) => (
  <Flex
    flexDir="row"
    justifyContent="center"
    alignItems="center"
    bgColor="white"
    height="50px"
    _hover={{
      bgColor: colors.brand.primary,
      cursor: 'pointer',
    }}
    onClick={() => props.selectOption(props.data)}
  >
    <img
      style={{ marginRight: '5px', width: 15 }}
      src={props.data.icon}
      alt={props.data.label}
    />
    <Text paddingLeft={2} color="black">
      {props.data.label}
    </Text>
  </Flex>
);

const dropdownStyles: StylesConfig = {
  input: (styles) => ({
    ...styles,
    marginLeft: '20px',
    backgroundColor: colors.brand.secondary,
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: colors.brand.primary,
    position: 'relative',
    textAlignLast: 'center',
    fontFamily: 'Clash Grotesk',
    textTransform: 'uppercase',
    fontWeight: 400,
    fontSize: '14px',
    borderColor: 'black',
    height: '50px',
    borderRadius: 0,
    cursor: 'pointer',

    ':before': {
      display: 'block',
      background: `url(${ethereumLogo}) no-repeat`,
      height: 10,
      width: 10,
    },
    ':hover': {
      color: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
  }),
  dropdownIndicator: (styles) => {
    return {
      ...styles,
      color: 'black',
      position: 'absolute',
      right: '5px',
    };
  },
};

// Allows user to select the wallet they want to login with
const ConnectWallet = (props: ConnectWalletProps) => {
  const { isOpen, onClose } = props;
  const {
    connectWallet,
    isAuthenticated,
    userAddress,
    provider,
    switchAccount,
    network,
    setNetwork,
    logout,
  } = useAuth();
  const { reset } = useNFT();
  const handleConnectOnclick = async (walletType) => {
    try {
      switch (walletType) {
        case 'walletconnect': {
          try {
            await connectWallet(walletType);
            await localforage.setItem('web3Provider', 'walletconnect');
            onClose();
          } catch (e) {
            console.log('Error', e);
          }
          break;
        }
        case 'tokenproof': {
          try {
            await connectWallet(walletType);
            await localforage.setItem('web3Provider', 'tokenproof');
            onClose();
          } catch (e) {
            console.log('Error', e);
          }
          break;
        }
        default: {
          await connectWallet(walletType);
          await localforage.setItem('web3Provider', 'metamask');
          onClose();
        }
      }
    } catch (e) {
      console.error(
        'There was an error logging into your account. Send an email to gm@hologram.xyz for further assistance.'
      );
    }
  };

  const handleNetworkSelect = async (e: any) => {
    // Ensure reset happens when different network is selected from current
    if (network !== e.value) {
      await localforage.removeItem('supportedNFTs');
      await localforage.removeItem('backgroundNFTs');
      await reset();
      setNetwork(e.value);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent
        p="20px"
        bgImage={grainTexture}
        bgColor={colors.brand.tertiary}
      >
        <ModalHeader display="flex" alignItems="center" flexDir="column">
          <Heading as="h1" size="lg">
            {!isAuthenticated ? 'Login' : 'Your Account'}
          </Heading>
          {isAuthenticated && (
            <Text pt={2} fontSize="md">
              {userAddress}
            </Text>
          )}
        </ModalHeader>
        <ModalBody w="100%">
          {!isAuthenticated ? (
            <>
              <Box mb="10px">
                <Button
                  text="Connect with Metamask"
                  variant="outline"
                  height="50px"
                  icon={
                    <img
                      width="20px"
                      height="100%"
                      src={metamaskLogo}
                      alt="metamask"
                    />
                  }
                  onClick={async () => {
                    handleConnectOnclick('injected');
                    await reset();
                  }}
                />
              </Box>
              <Box mt="10px">
                <Button
                  text="Connect with WalletConnect"
                  variant="outline"
                  height="50px"
                  icon={
                    <img
                      width="20px"
                      height="100%"
                      src={walletConnectLogo}
                      alt="walletconnect"
                    />
                  }
                  onClick={async () => {
                    handleConnectOnclick('walletconnect');
                    await reset();
                  }}
                />
              </Box>
              <Box mt="10px">
                <Button
                  text="Connect with Tokenproof"
                  variant="outline"
                  height="50px"
                  icon={
                    <img
                      width="20px"
                      height="100%"
                      src={tokenproofLogo}
                      alt="tokenproof"
                    />
                  }
                  onClick={async () => {
                    handleConnectOnclick('tokenproof');
                    await reset();
                  }}
                />
              </Box>
            </>
          ) : (
            <>
              <Box mb="10px">
                <Select
                  defaultValue={MULTICHAIN_OPTIONS.find((obj) => {
                    return obj.value === network;
                  })}
                  options={MULTICHAIN_OPTIONS}
                  styles={dropdownStyles}
                  components={{
                    Option: IconOption,
                    IndicatorSeparator: () => null,
                  }}
                  isSearchable={false}
                  onChange={handleNetworkSelect}
                />
              </Box>
              {provider === 'injected' && (
                <Box mb="10px">
                  <Button
                    variant="outline"
                    text="Switch Account"
                    height="50px"
                    icon={<RepeatIcon />}
                    onClick={async () => {
                      switchAccount();
                      await reset();
                    }}
                  />
                </Box>
              )}
              <Box mb="10px">
                <Button
                  text="Logout"
                  variant="outline"
                  height="50px"
                  icon={<LockIcon />}
                  onClick={async () => {
                    await logout();
                  }}
                />
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter w="100%">
          <Button text="Close" variant="outline" onClick={onClose} />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConnectWallet;
