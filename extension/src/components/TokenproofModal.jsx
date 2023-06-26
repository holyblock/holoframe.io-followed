import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import React from "react";
import QRCodeScan from "../components/QRCodeScan";
import grainTexture from '../assets/img/grain.svg';
import { colors } from "../utils/theme";

const TokenproofModal = ({ onClose, isOpen }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs" isCentered>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent bgImage={grainTexture} bg={colors.brand.tertiary}>
        <ModalCloseButton />
        <ModalBody>
          <QRCodeScan />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TokenproofModal;
