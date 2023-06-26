import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  ModalBody,
  ModalFooter,
  Heading,
  Flex,
  Input,
} from '@chakra-ui/react';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';
import { colors } from 'renderer/styles/theme';
import { useNFT } from 'renderer/contexts/NFTContext';

interface YoutubeLinkProps {
  isOpen: boolean;
  onClose: () => void;
}

const YoutubeLink = (props: YoutubeLinkProps) => {
  const { isOpen, onClose } = props;
  const [youtubeLink, setYoutubeLink] = useState<string>('');
  const { addItem } = useNFT();

  useEffect(() => {
    setYoutubeLink('');
  }, [isOpen]);

  const onAddSound = async () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <Heading mb={2} textAlign="center" size="md">
          Add Youtube Link
        </Heading>
      }
    >
      <ModalBody>
        <FormControl mb={5}>
          <Input
            placeholder="https://..."
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
          />
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Box pr={2} w="100%">
          <Button
            text="Cancel"
            variant="outline"
            secondaryColor="white"
            height="50px"
            onClick={onClose}
          />
        </Box>
        <Box pr={2} w="100%">
          <Button
            text="Add Sound"
            variant="solid"
            color={colors.brand.primary}
            height="50px"
            onClick={onAddSound}
            disabled={youtubeLink === ''}
          />
        </Box>
      </ModalFooter>
    </Modal>
  );
};

export default YoutubeLink;
