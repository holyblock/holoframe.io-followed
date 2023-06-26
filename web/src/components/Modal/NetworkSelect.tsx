import Image from 'next/image';
import { Box, Heading, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import Button from '../Button';
import { useNetwork, useSwitchNetwork } from 'wagmi';

// Allows user to select the wallet they want to login with
const NetworkSelect = ({ isOpen, onClose }) => {
  const { switchNetwork, isLoading } = useSwitchNetwork();
  const { chains } = useNetwork();

  const renderNetworkButtons = chains.map((chain) => {
    return (
      <Box key={chain.id} mb="10px">
        <Button
          borderColor='black'
          color='black'
          disabled={isLoading}
          text={isLoading
            ? `Connecting...`
            : chain.name
          }
          variant="outline"
          height="50px"
          icon={
            <Image width="20px" height="100%" src={`/${chain.name.toLowerCase()}.svg`} alt="metamask" />
          }
          onClick={async () => {
            if (switchNetwork && chain.id) {
              switchNetwork(chain.id);
            }
            onClose();
          }}
        />
      </Box>
    )
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent
        bgColor="#34414B"
        bgImage='url("/media/grain.svg")'
        p="20px"
      >
        <ModalHeader display="flex" justifyContent="center">
          <Heading as="h1" size="lg">
            Select Network
          </Heading>
        </ModalHeader>
        <ModalBody w="100%">
          { renderNetworkButtons }
        </ModalBody>
        <ModalFooter w="100%">
          <Button
            text="Close"
            variant="outline"
            color="white"
            onClick={onClose}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default NetworkSelect;