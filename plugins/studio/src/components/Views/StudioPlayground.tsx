import React, { useEffect, useState } from 'react';
import { Box, Center, Grid, Flex, VStack, Text, Tooltip } from '@chakra-ui/react';
import { AiOutlineFullscreen } from 'react-icons/ai';
import { 
  BsCameraFill, 
  BsStopCircle, 
  BsCameraVideoFill 
} from 'react-icons/bs';
import { RiPictureInPicture2Fill } from 'react-icons/ri';
import StudioSharing from '../Modal/StudioSharing';
import { useStyle } from '../../contexts/StyleContext';
import { colors } from '../../styles/theme';

interface StudioPlaygroundProps {
  canvas: HTMLCanvasElement | null
  pictureInPicture: HTMLVideoElement | null
}

const StudioPlayground = (props: StudioPlaygroundProps) => {
  const {
    canvas,
    pictureInPicture,
  } = props;
  const { darkEnabled } = useStyle();
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState<any>(null);
  const [screenshot, setScreenshot] = useState<string>();
  const [recordData, setRecordData] = useState<string>();
  const [socialSharingOpen, setSocialSharingOpen] = useState(false);
  const [chunks, setChunks] = useState<any>([]);

  useEffect(() => {
    if (!socialSharingOpen) {
      setScreenshot(null);
      setRecordData(null);
    }
  }, [socialSharingOpen]);

  const onCapture = async () => {
    if (canvas) {
      const screenshotData = await canvas.toDataURL();
      setScreenshot(screenshotData as string);
      setSocialSharingOpen(true);
    }
  };

  const onRecord = async () => {
    if (!canvas) return;
    let canvasRecorder: any;
    if (recorder) {
      canvasRecorder = recorder;
    } else {
      // Initialize canvas recorder
      const stream = (canvas as any).captureStream(60);
      const mimeType = 'video/webm';
      canvasRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      canvasRecorder.ondataavailable = (event) => {
        const newChunks = chunks;
        event.data.size && newChunks.push(event.data);
        setChunks(newChunks);
      };
      canvasRecorder.onstop = () => {
        if (chunks.length) {
          const blob = new Blob(chunks);
          const dataURL = URL.createObjectURL(blob);
          setRecordData(dataURL);
        }
      };
    }
    // Start recorder
    if (!recording) {
      canvasRecorder.start();
      setRecording(true);
      setRecorder(canvasRecorder);
    } else {
      // Stop and dispose
      setRecording(false);
      setRecorder(null);
      setChunks([]);
      setSocialSharingOpen(true);
      canvasRecorder.stop();
    }
  }

  const onPictureInPicture = async () => {
    if (canvas && pictureInPicture && pictureInPicture.srcObject) {
      try {
        if (pictureInPicture !== (document as any).pictureInPictureElement) {
          await (pictureInPicture as any).requestPictureInPicture();
        } else {
          await (document as any).exitPictureInPicture();
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <Flex justifyContent='center' alignItems='center'>
      <Grid 
        templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
        gap={8} 
        py={4} 
      >
        <Tooltip label='Take a picture as your character!'>
          <Box
            rounded={'md'}
            color={darkEnabled ? 'white' : 'black'}
            w={150}
            h={150}
            textAlign='center'
            outline={`2px solid ${darkEnabled ? 'white' : 'black'}`}
            _hover={{
              opacity: 1,
              cursor: 'pointer',
              outline: `2px solid ${colors.brand.primary}`,
              color: colors.brand.primary
            }}
            onClick={onCapture}
          >
            <Center h='100%'>
              <VStack>
                <BsCameraFill color={darkEnabled ? 'white' : 'black'} size={25}/>
                <Text color={darkEnabled ? 'white' : 'black'}>Take Selfie</Text>
              </VStack>
            </Center>
          </Box>
        </Tooltip>
        <Tooltip 
          label={!recording
            ? 'Record a quick clip of your character!'
            : 'Stop recording and download your clip!'
          }
        >
          <Box
            rounded={'md'}
            color={!recording ? 'black' : 'red'}
            w={150}
            h={150}
            textAlign='center'
            outline={!recording 
              ? `2px solid ${darkEnabled ? 'white' : 'black'}` 
              : '2px solid red'
            }
            _hover={{
              opacity: 1,
              cursor: 'pointer',
              outline: !recording ? `2px solid ${colors.brand.primary}` : '2px solid red',
              color: !recording ? colors.brand.primary : 'red'
            }}
            onClick={onRecord}
          >
            <Center h='100%'>
              <VStack>
                {!recording 
                  ? <BsCameraVideoFill size={25} color={darkEnabled ? 'white' : 'black'} /> 
                  : <BsStopCircle size={25} color='red' />
                }
                <Text color={darkEnabled ? 'white' : 'black'}>Take Video</Text>
              </VStack>
            </Center>
          </Box>
        </Tooltip>
        { pictureInPicture &&
          <Tooltip label='Enter picture-in-picture mode!'>
            <Box
              rounded={'md'}
              color='#000000'
              w={150}
              h={150}
              textAlign='center'
              outline={`2px solid ${darkEnabled ? 'white' : 'black'}`}
              _hover={{
                opacity: 1,
                cursor: 'pointer',
                outline: `2px solid ${colors.brand.primary}`,
                color: colors.brand.primary
              }}
              onClick={onPictureInPicture}
            >
              <Center h='100%'>
                <VStack>
                  <RiPictureInPicture2Fill color={darkEnabled ? 'white' : 'black'} size={25} />
                  <Text color={darkEnabled ? 'white' : 'black'}>Picture-in-picture</Text>
                </VStack>
              </Center>
            </Box>
          </Tooltip>
        }
      </Grid>
      <StudioSharing
        isOpen={socialSharingOpen}
        setIsOpen={setSocialSharingOpen}
        screenshot={screenshot}
        recordData={recordData}
      />
    </Flex>
  );
};

export default StudioPlayground;