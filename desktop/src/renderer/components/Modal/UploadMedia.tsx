import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  ModalBody,
  ModalFooter,
  Heading,
  Flex,
} from '@chakra-ui/react';
import Modal from 'renderer/components/Modal';
import Dropzone from 'renderer/components/Input/Dropzone';
import Button from 'renderer/components/Button';
import { colors } from 'renderer/styles/theme';
import { useNFT } from 'renderer/contexts/NFTContext';
import { NFTMetadata } from 'renderer/types';
import { SceneType } from 'renderer/types/types';
import config from '../../../../../utils/config';

interface UploadMediaProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadMedia = (props: UploadMediaProps) => {
  const { isOpen, onClose } = props;
  const [file, setFile] = useState<any>(null);
  const { addItem } = useNFT();

  useEffect(() => {
    setFile(null);
  }, [isOpen]);

  const onImageFileDrop = useCallback(async (acceptedFiles) => {
    acceptedFiles.map((f) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target) {
          const dataURL = e.target.result as string;
          // Extract 'image/jpeg' from  'data:image/jpeg;base64...'
          const contentType = dataURL.substring(
            dataURL.indexOf(':') + 1,
            dataURL.indexOf(';')
          );

          // Check if content type is supported
          if (config.desktop.scene.supportedMimeTypes.includes(contentType)) {
            setFile({
              filename: f.name,
              result: dataURL,
              contentType,
            });
          }
        }
      };
      reader.readAsDataURL(f);
      return f;
    });
  }, []);

  const onAddToScene = () => {
    const data: NFTMetadata = {
      image: file.result,
    };
    if (
      config.desktop.scene.supportedImageMimeTypes.includes(file.contentType)
    ) {
      addItem(data, SceneType.image);
    } else if (
      config.desktop.scene.supportedVideoMimeTypes.includes(file.contentType)
    ) {
      addItem(data, SceneType.video);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <Heading mb={2} textAlign="center" size="md">
          Upload media
        </Heading>
      }
    >
      <ModalBody>
        <FormControl mb={5}>
          {file &&
            config.desktop.scene.supportedImageMimeTypes.includes(
              file.contentType
            ) && (
              <Flex justifyContent="center" maxHeight="300px">
                <img
                  src={file.result}
                  alt="uploaded"
                  crossOrigin="anonymous"
                  style={{
                    maxHeight: '300px',
                    position: 'relative',
                    zIndex: -1,
                  }}
                />
              </Flex>
            )}
          {file &&
            config.desktop.scene.supportedVideoMimeTypes.includes(
              file.contentType
            ) && (
              <Flex justifyContent="center" maxHeight="300px">
                <video
                  src={file.result}
                  crossOrigin="anonymous"
                  style={{
                    maxHeight: '300px',
                    position: 'relative',
                    zIndex: -1,
                  }}
                  autoPlay
                  loop
                />
              </Flex>
            )}
          {!file && (
            <Dropzone
              accept=".png,.jpg,.jpeg,.mp4,.webm,.ogv"
              currFile={file}
              placeholder="Upload images or video"
              droppedFilename={file?.filename}
              onDrop={onImageFileDrop}
            />
          )}
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
            text="Add to scene"
            variant="solid"
            color={colors.brand.primary}
            height="50px"
            onClick={onAddToScene}
            disabled={file === null}
          />
        </Box>
      </ModalFooter>
    </Modal>
  );
};

export default UploadMedia;
