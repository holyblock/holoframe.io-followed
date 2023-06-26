import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Box,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useMoralis } from "react-moralis";
import { Connector, useConnect, useSwitchNetwork } from "wagmi";

import Button from "../Button";
import localforage from "localforage";
import QRCodeScan from "./QRCodeScan";

// Allows user to select the wallet they want to login with
interface ConnectWalletProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChainId?: number;
}

const ConnectWallet = (props: ConnectWalletProps) => {
  const { isOpen, onClose, selectedChainId } = props;
  const { Moralis, enableWeb3, isWeb3Enabled } = useMoralis();
  const { switchNetwork } = useSwitchNetwork();
  const { connect, connectors, isLoading } = useConnect();
  const [chainId, setChainId] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [tokenproofSelected, setTokenproofSelected] = useState(false);

  useEffect(() => {
    (async () => {
      const cachedProvider: string | null = await localforage.getItem(
        "web3Provider"
      );
      if (cachedProvider) {
        try {
          if (cachedProvider === "MetaMask") {
            connect({ connector: connectors[0] });
          } else if (cachedProvider === "WalletConnect") {
            connect({ connector: connectors[1] });
          }
        } catch (e) {
          console.error(e);
        }
      }
    })();
  }, []);

  // Initiate account and network change listeners
  useEffect(() => {
    if (isWeb3Enabled && Moralis) {
      // Set current chain Id
      const currChainIdHex = Moralis.getChainId();
      if (currChainIdHex) {
        setChainId(parseInt(Moralis.getChainId()!, 16));
      }

      Moralis.onAccountChanged(async (address) => {
        console.log(`Changed Metamask account to address ${address}`);
        enableWeb3({ chainId: chainId });
      });
      Moralis.onChainChanged(async (chainId) => {
        console.log(`Changed chain Id to ${chainId}`);
        if (chainId) {
          setChainId(parseInt(chainId, 16));
        }
      });
      setInitialized(true);
    }
  }, [isWeb3Enabled, Moralis]);

  useEffect(() => {
    (async () => {
      if (initialized) {
        enableWeb3({ chainId: chainId });
      }
    })();
  }, [chainId, initialized]);

  const renderConnectButtons = connectors.map((connector: Connector) => {
    return (
      <Box key={connector.id} mb="10px">
        <Button
          disabled={!connector.ready}
          text={
            isLoading ? `Connecting...` : `Connect with ${connector.name}`
          }
          variant="outline"
          color="white"
          height="50px"
          icon={
            <Image
              width="20px"
              height="100%"
              src={`/${connector.name}.svg`}
              alt="metamask"
            />
          }
          onClick={async () => {
            if (selectedChainId && switchNetwork) {
              
              await switchNetwork(selectedChainId);
            }
            connect({ connector });
            await localforage.setItem("web3Provider", connector.name);
            onClose();
          }}
        />
      </Box>
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setTokenproofSelected(false);
        onClose();
      }}
      isCentered
      size="md"
    >
      <ModalOverlay />
      <ModalContent
        bgColor="#34414B"
        bgImage='url("/media/grain.svg")'
        p="20px"
      >
        <ModalHeader display="flex" justifyContent="center">
          <Heading as="h1" size="lg">
            {!tokenproofSelected ? "Connect" : "Scan QR Code"}
          </Heading>
        </ModalHeader>
        <ModalBody w="100%">
          {tokenproofSelected ? (
            <QRCodeScan onSuccess={onClose} />
          ) : (
            <>
              {renderConnectButtons}
              <Box mb="10px">
                <Button
                  text="Connect with Tokenproof"
                  variant="outline"
                  color="white"
                  height="50px"
                  icon={
                    <Image
                      width="20px"
                      height="100%"
                      src="/tokenproof.svg"
                      alt="tokenproof"
                    />
                  }
                  onClick={() => setTokenproofSelected(true)}
                />
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter w="100%">
          {tokenproofSelected ? (
            <Button
              text="Back"
              variant="outline"
              color="white"
              onClick={() => setTokenproofSelected(false)}
            />
          ) : (
            <Button
              text="Close"
              variant="outline"
              color="white"
              onClick={onClose}
            />
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConnectWallet;
