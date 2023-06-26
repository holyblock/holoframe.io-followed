import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { colors } from '@/styles/theme';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  header?: any;
  size?: string;
  children: any;
}

const CustomModal = (props: CustomModalProps) => {
  const { isOpen, onClose, header, size, children } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={size ?? 'xl'}>
      <ModalOverlay />
      <ModalContent p="20px" bgColor={colors.brand.secondary}>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton color="white" />
        {children}
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
