import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  ModalBody,
  ModalFooter,
  Heading,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import Modal from 'renderer/components/Modal';
import Dropzone from 'renderer/components/Input/Dropzone';
import Button from 'renderer/components/Button';
import { colors } from 'renderer/styles/theme';
import { useNFT } from 'renderer/contexts/NFTContext';
import { useTracking } from 'renderer/contexts/TrackingContext';
import { usePreviewMedia } from 'renderer/contexts/PreviewMediaContext';
import { useCanvas } from 'renderer/contexts/CanvasContext';
import dataURItoBlob from '../../../../../utils/helpers/convertDataURIToBlob';
import config from '../../../../../utils/config';
import { MediaType } from '../../../../../utils/types/index';

interface UploadMediaProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadVideo = (props: UploadMediaProps) => {
  const { isOpen, onClose } = props;
  const [file, setFile] = useState(null);
  const { setVideoBackgroundMode } = useNFT();
  const { setFaceTrackingEnabled } = useTracking();
  const { setPreviewMediaDataUrl, setPreviewMediaType, setPreviewGifDataUrl } =
    usePreviewMedia();
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const { videoRef } = useCanvas();

  useEffect(() => {
    setFile(null);
  }, [isOpen]);

  const onVideoFileDrop = useCallback(async (acceptedFiles) => {
    acceptedFiles.map((f) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target) {
          const dataURL = e.target.result as string;
          // Extract 'video/mp4' from  'data:video/mp4;base64...'
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

  const onAddMedia = () => {
    setFaceTrackingEnabled(true);
    setVideoBackgroundMode(true);
    videoRef.current.srcObject = null;

    if (file.contentType === config.desktop.scene.supportedGifMimeTypes[0]) {
      setPreviewMediaType(MediaType.GIF);
      setPreviewMediaDataUrl('');
      setPreviewGifDataUrl(file.result);
      setIsConverting(true);
      convertGifToMedia(file.result)
        .then(async (res: Response) => {
          if (!res.ok) {
            setIsConverting(false);
          } else {
            const videoBlob = await res.blob();
            setPreviewMediaDataUrl(URL.createObjectURL(videoBlob));
            setIsConverting(false);
          }
          onClose();
        })
        .catch((e) => {
          setIsConverting(false);
          onClose();
        });
    } else {
      setPreviewMediaType(MediaType.VIDEO);
      setPreviewMediaDataUrl(file.result);
      onClose();
    }
  };

  const convertGifToMedia = async (dataURI: string) => {
    const blob = dataURItoBlob(dataURI);
    const formData = new FormData();
    formData.append('file', blob);
    const url = `${config.apiUrl}/media/convert/gif`;
    const videoRes = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return videoRes;
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
            (config.desktop.scene.supportedVideoMimeTypes.includes(
              file.contentType
            ) ? (
              <Flex justifyContent="center" maxHeight="300px">
                <video
                  crossOrigin="anonymous"
                  style={{
                    maxHeight: '300px',
                    position: 'relative',
                    zIndex: -1,
                  }}
                  autoPlay
                  loop
                >
                  <source src={file.result} type="video/mp4" />
                </video>
              </Flex>
            ) : config.desktop.scene.supportedGifMimeTypes.includes(
                file.contentType
              ) ? (
              <Flex justifyContent="center" maxHeight="300px">
                <img src={file.result} alt="preview video" />
              </Flex>
            ) : (
              <></>
            ))}
          {!file && (
            <Dropzone
              accept=".mp4,.mov,.MOV,.GIF,.gif"
              currFile={file}
              placeholder="Add MP4, MOV, GIF"
              droppedFilename={file?.filename}
              onDrop={onVideoFileDrop}
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
            text={isConverting ? <Spinner /> : 'Add Media'}
            variant="solid"
            color={colors.brand.primary}
            height="50px"
            onClick={onAddMedia}
            disabled={file === null}
          />
        </Box>
      </ModalFooter>
    </Modal>
  );
};

export default UploadVideo;
