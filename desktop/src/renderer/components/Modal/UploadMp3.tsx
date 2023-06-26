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
import {
  AudioRecordMode,
  useRecording,
} from 'renderer/contexts/RecordingContext';
import config from '../../../../../utils/config';

interface UploadMp3Props {
  isOpen: boolean;
  onClose: () => void;
}

const UploadMp3 = (props: UploadMp3Props) => {
  const { isOpen, onClose } = props;
  const [file, setFile] = useState<any>(null);
  const { scene } = useNFT();
  const { audioRecordModes, setAudioRecordModes } = useRecording();

  useEffect(() => {
    setFile(null);
  }, [isOpen]);

  const onMp3FileDrop = useCallback(async (acceptedFiles) => {
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
          if (
            config.desktop.scene.supportedSoundMimeTypes.includes(contentType)
          ) {
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

  const onAddSound = async () => {
    if (
      config.desktop.scene.supportedSoundMimeTypes.includes(file.contentType)
    ) {
      const mp3Items = scene.current.getMp3Items();
      mp3Items.forEach((mp3) => mp3.pause());
      await scene.current.addMp3Item(file.result);
      setAudioRecordModes([...audioRecordModes, AudioRecordMode.MP3]);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <Heading mb={2} textAlign="center" size="md">
          Add Sound
        </Heading>
      }
    >
      <ModalBody>
        <FormControl mb={5}>
          {!file ? (
            <Dropzone
              accept="audio/mpeg"
              currFile={file}
              placeholder="Upload MP3"
              droppedFilename={file?.filename}
              onDrop={onMp3FileDrop}
            />
          ) : (
            <audio
              controls
              src={file.result}
              loop
              style={{ margin: '0 auto' }}
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
            text="Add Sound"
            variant="solid"
            color={colors.brand.primary}
            height="50px"
            onClick={onAddSound}
            disabled={file === null}
          />
        </Box>
      </ModalFooter>
    </Modal>
  );
};

export default UploadMp3;
