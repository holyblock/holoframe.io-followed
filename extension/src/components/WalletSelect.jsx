import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Heading, Flex, Stack, useDisclosure } from '@chakra-ui/react';
import Button from '../components/Button'
import metamaskLogo from '../assets/img/metamask.svg';
import walletconnectLogo from '../assets/img/walletconnect.svg';
import tokenproofLogo from '../assets/img/tokenproof.svg';
import TokenproofModal from './TokenproofModal';

// Allows user to select the wallet they want to login with
const WalletSelect = ({ onBack, showError }) => {
  const { connectWallet } = useAuth();
  const [metamaskSelected, setMetamaskSelected] = useState(false);
  const [walletconnectSelected, setWalletconnectSelected] = useState(false);
  const [tokenproofSelected, setTokenproofSelected] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConnectOnclick = async (walletType) => {
    try {
      connectWallet(walletType, false);
    } catch (e) {
      showError('There was an error logging into your account.');
    }
  };

  return (
    <>
      <Flex h="100%" w="100%" flexDir="column" justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h1" size="md">
            Login
          </Heading>
        </Box>
        <Stack w="320px" spacing={5}>
          <Button
            text="Connect with Metamask"
            color="transparent"
            variant="outline"
            height="50px"
            icon={
              <img width="20px" src={metamaskLogo} alt="metamask" />
            }
            onClick={() => {
              handleConnectOnclick('injected');
              setMetamaskSelected(true);
            }}
            disabled={metamaskSelected}
          />
          <Button
            text="Connect with WalletConnect"
            color="transparent"
            variant="outline"
            height="50px"
            icon={
              <img width="20px" src={walletconnectLogo} alt="walletconnect" />
            }
            onClick={() => {
              handleConnectOnclick('walletconnect');
              setWalletconnectSelected(true);
            }}
            disabled={walletconnectSelected}
          />
          <Button
            text="Connect with Tokenproof"
            color="transparent"
            variant="outline"
            height="50px"
            icon={
              <img width="20px" src={tokenproofLogo} alt="tokenproof" />
            }
            onClick={() => {
              onOpen();
              setTokenproofSelected(true);
            }}
            disabled={tokenproofSelected}
          />
        </Stack>
        <Box h="40px" w="320px">
          <Button
            text="Back"
            color="transparent"
            variant="outline"
            height="50px"
            onClick={onBack}
          />
        </Box>
      </Flex>
      <TokenproofModal
        isOpen={isOpen}
        onClose={() => {
          setTokenproofSelected(false);
          onClose();
        }}
      />
    </>
  );
}

export default WalletSelect;