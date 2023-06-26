import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  ModalBody,
  ModalFooter,
  Heading,
  Select,
} from '@chakra-ui/react';
import { ipcRenderer } from 'electron';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';
import { colors } from 'renderer/styles/theme';
import { useNFT } from 'renderer/contexts/NFTContext';
import { SceneType } from 'renderer/types';

interface DisplayCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisplayCapture = (props: DisplayCaptureProps) => {
  const { isOpen, onClose } = props;
  const [link, setLink] = useState('');
  const [sources, setSources] = useState<any>();
  const [selectedSourceID, setSelectedSourceID] = useState<string>();
  const { addItem } = useNFT();

  useEffect(() => {
    (async () => {
      if (isOpen) {
        await ipcRenderer.send('get-sources', {
          types: ['screen'],
        });

        ipcRenderer.on('screen-sources', async (evt, newSources) => {
          setSources(newSources);
          if (newSources && newSources.length > 0) {
            const newSourceID = newSources[0].id;
            setSelectedSourceID(newSourceID);
            await updatePreviewVideo(newSourceID);
          }
        });
      }
    })();
    setLink('');
  }, [isOpen]);

  const renderSources = sources?.map((source) => {
    let { name } = source;
    if (source.name.length > 60) {
      name = `${source.name.substring(0, 60)}...`;
    }
    return <option value={source.id}>{name}</option>;
  });

  const updatePreviewVideo = async (sourceID: string) => {
    try {
      const stream = await (navigator.mediaDevices as any).getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceID,
          },
        },
      });
      const video = document.getElementById('display') as HTMLVideoElement;
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();
    } catch (error) {
      console.error(error);
    }
  };

  const onSelectSource = async (e) => {
    const newSourceID = e.target.value;
    setSelectedSourceID(newSourceID);
    await updatePreviewVideo(newSourceID);
  };

  const onAddToScene = async () => {
    if (selectedSourceID !== undefined) {
      const data = {
        image: selectedSourceID,
      };
      addItem(data, SceneType.window);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <Heading mb={2} textAlign="center" size="md">
          Add display
        </Heading>
      }
    >
      <ModalBody>
        <Select value={selectedSourceID} onChange={onSelectSource}>
          {renderSources}
        </Select>
        <Flex justifyContent="center" mt={4} height={['100%', '274.5px']}>
          <video
            id="display"
            style={{
              height: '100%',
            }}
          />
        </Flex>
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
            disabled={link === null}
          />
        </Box>
      </ModalFooter>
    </Modal>
  );
};

export default DisplayCapture;
