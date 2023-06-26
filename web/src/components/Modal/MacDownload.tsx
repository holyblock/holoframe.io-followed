import { 
  Box,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Heading,
} from "@chakra-ui/react";
import Button from "../Button";
import Image from "next/image";
import config from "../../../../utils/config";

const MacDownload = ({ isOpen, onClose }) => {
  const onDownload = (url: string) => {
    window.location.href = url;
    onClose();
  };
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
              Download for Mac
            </Heading>
          </ModalHeader>
          <ModalBody w="100%">
            <Box mb="10px">
              <Button
                text="Apple Chip"
                variant="outline"
                color="black"
                height="50px"
                icon={
                  <Image width="35px" height="100%" src={'/media/apple-m1.svg'} alt="m1" />
                }
                onClick={() => {
                  onDownload(config.web.download.mac.apple);
                }}
              />
            </Box>
            <Box mt="10px">
              <Button
                text="Intel Chip"
                variant="outline"
                color="black"
                height="50px"
                icon={
                  <Image width="35px" height="100%" src={'/media/intel.svg'} alt="intel" />
                }
                onClick={() => {
                  onDownload(config.web.download.mac.intel);
                }}
              />
            </Box>
          </ModalBody>
          <ModalFooter w="100%">
            <Button
              text="Close"
              variant="outline"
              color="black"
              onClick={onClose}
            />
          </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MacDownload;