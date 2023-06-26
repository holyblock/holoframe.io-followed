import React from 'react';
import { Box, Heading, Flex, Stack } from '@chakra-ui/react';
import localforage from 'localforage';
import Button from './Button'
import ethereumLogo from '../assets/img/ethereum.svg';
import goerliLogo from '../assets/img/goerli.svg';
import arbitrumLogo from '../assets/img/arbitrum.svg';
import { colors } from '../utils/theme';

// Allows user to select the network they want to read assets from
const NetworkSelect = ({ network, setNetwork, onBack }) => {
  const onSelectNetwork = async (networkName) => {
    setNetwork(networkName);
    await chrome.storage.sync.set({ currentNetwork: networkName });
    await localforage.clear(); // Clear NFT cache
  };

  return (
    <Flex h="100%" w="100%" flexDir="column" justifyContent="space-between" alignItems="center">
      <Box>
        <Heading as="h1" size="md">
          Select Network
        </Heading>
      </Box>
      <Stack w="320px" spacing={5}>
        <Button
          text="Mainnet"
          selected={network === "eth"}
          variant="outline"
          color="transparent"
          secondaryColor={colors.brand.primary}
          secondaryTextColor="black"
          height="50px"
          icon={
            <img width="20px" src={ethereumLogo} alt="ethereum" />
          }
          onClick={() => {
            onSelectNetwork('eth');
          }}
        />
        <Button
          text="Goerli"
          selected={network === "goerli"}
          id="goerli"
          variant="outline"
          color="transparent"
          secondaryColor={colors.brand.primary}
          secondaryTextColor="black"
          height="50px"
          icon={
            <img width="20px" src={goerliLogo} alt="goerli" />
          }
          onClick={async () => {
            onSelectNetwork('goerli');
          }}
        />
        <Button
          text="Arbitrum"
          selected={network === "arbitrum"}
          id="arbitrum"
          variant="outline"
          color="transparent"
          secondaryColor={colors.brand.primary}
          secondaryTextColor="black"
          height="50px"
          icon={
            <img width="20px" src={arbitrumLogo} alt="arbitrum" />
          }
          onClick={async () => {
            onSelectNetwork('arbitrum');
          }}
        />
      </Stack>
      <Box h="40px" w="320px">
        <Button
          text="Back"
          variant="outline"
          height="50px"
          color="transparent"
          onClick={onBack}
        />
      </Box>
    </Flex>
  );
}

export default NetworkSelect;
