/* eslint-disable react/no-array-index-key */
import { useState } from 'react';
import {
  Flex,
  Grid,
  Heading,
  Tag,
  Text,
  Tooltip,
  HStack,
  Container,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BsImage, BsDisplay, BsPlus } from 'react-icons/bs';
import { GoBrowser } from 'react-icons/go';
import { VscSymbolColor } from 'react-icons/vsc';
import { colors } from 'renderer/styles/theme';
import { useNFT } from 'renderer/contexts/NFTContext';
import { usePreviewMedia } from 'renderer/contexts/PreviewMediaContext';
import {
  AudioRecordMode,
  useRecording,
} from 'renderer/contexts/RecordingContext';

import UploadMedia from 'renderer/components/Modal/UploadMedia';
import ColorPicker from 'renderer/components/Modal/ColorPicker';
import WindowCapture from 'renderer/components/Modal/WindowCapture';
import DisplayCapture from 'renderer/components/Modal/DisplayCapture';
import expressionKeys from 'renderer/config/expressions';
import UploadMp3 from 'renderer/components/Modal/UploadMp3';
import UploadVideo from 'renderer/components/Modal/UploadVideo';
import YoutubeLink from 'renderer/components/Modal/YoutubeLink';
import { WaveformView } from 'renderer/components/WaveformView';
import usePlatform from 'renderer/hooks/usePlatform';
import { TbTypography } from 'react-icons/tb';
import { SceneType } from 'renderer/types';
import settingsSvgIcon from '../../../../assets/img/settings.svg';

type StyledToggleButtonProps = {
  active?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
};

const StyledToggleButton = ({
  active = false,
  onClick,
  children,
}: StyledToggleButtonProps) => {
  return (
    <Flex
      rounded="md"
      color="white"
      h="40px"
      alignItems="center"
      justifyContent="center"
      outline={`2px solid ${active ? colors.brand.primary : 'white'}`}
      _hover={{
        opacity: 1,
        cursor: 'pointer',
        outline: `2px solid ${colors.brand.primary}`,
        color: colors.brand.primary,
      }}
      background={active ? colors.brand.primary : 'transparent'}
      onClick={onClick}
    >
      <HStack h="100%" justifyContent="center">
        {children}
      </HStack>
    </Flex>
  );
};
const Studio = () => {
  const platform = usePlatform();
  const {
    addItem,
    scene,
    expressions,
    selectedExps,
    setSelectedExps,
    videoBackgroundMode,
    setVideoBackgroundMode,
  } = useNFT();
  const { audioRecordModes, setAudioRecordModes } = useRecording();
  const { setPreviewMediaDataUrl } = usePreviewMedia();
  const [uploadMediaOpen, setUploadMediaOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [windowCaptureOpen, setWindowCaptureOpen] = useState(false);
  const [displayCaptureOpen, setDisplayCaptureOpen] = useState(false);
  const [uploadMp3Open, setUploadMp3Open] = useState(false);
  const [uploadVideoOpen, setUploadVideoOpen] = useState<boolean>(false);
  const [youtubeLinkOpen, setYoutubeLinkOpen] = useState(false);

  const mp3Items = scene.current.getMp3Items();
  const [refresh, setRefresh] = useState(1);

  const renderExpressions = Array.from(expressions?.keys()).map(
    (expName: string, i: number) => {
      const isSelected = selectedExps.includes(expName);
      return (
        <Tooltip label={`⌥Option + ${expressionKeys[i]}`}>
          <Tag
            key={expName}
            m={1}
            onClick={() => onSelectExps(expName)}
            bgColor={isSelected ? colors.brand.primary : 'transparent'}
            color={isSelected ? 'black' : 'white'}
            outline="1px solid white"
            _hover={{
              cursor: 'pointer',
              bgColor: colors.brand.primary,
              color: 'black',
            }}
          >
            {expName}
          </Tag>
        </Tooltip>
      );
    }
  );

  const onSelectExps = (expName: string) => {
    if (selectedExps.includes(expName)) {
      setSelectedExps(selectedExps.filter((exp) => exp !== expName));
    } else {
      setSelectedExps(selectedExps.concat(expName));
    }
  };

  // const onSelectTexture = (textureIndex) => {
  //   let newTextureIndices = [];
  //   if (selectedTextureIndices.includes(textureIndex)) {
  //     newTextureIndices = selectedTextureIndices.filter(
  //       (exp) => exp !== textureIndex
  //     );
  //   } else {
  //     newTextureIndices = selectedTextureIndices.concat(textureIndex);
  //   }
  //   setSelectedTextureIndices(newTextureIndices);
  // };

  const handleChangeVideoBackgroundMode = (value: boolean) => {
    if (!value) {
      setVideoBackgroundMode(false);
      setPreviewMediaDataUrl(null);
    } else {
      setUploadVideoOpen(true);
    }
  };

  const addText = () => {
    addItem(
      {
        image: 'Add your text',
      },
      SceneType.text
    );
  };

  return (
    <Flex flexDir="column" alignItems="center" zIndex={97}>
      {expressions.size > 0 && (
        <Container maxW="container.md" mb={3}>
          <Heading size="sm">Add Expressions</Heading>
          <Flex py={4} flexWrap="wrap">
            {renderExpressions}
          </Flex>
        </Container>
      )}
      <Container maxW="container.md" my={3}>
        <Heading size="sm">Customize Scene</Heading>
        <Grid
          templateColumns={[
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
            'repeat(4, 1fr)',
            null,
          ]}
          gap={4}
          py={4}
        >
          <StyledToggleButton onClick={() => setColorPickerOpen(true)}>
            <VscSymbolColor color="white" size={20} />
            <Text color="white">Color</Text>
          </StyledToggleButton>
          <StyledToggleButton onClick={() => setUploadMediaOpen(true)}>
            <BsImage color="white" size={20} />
            <Text color="white">Media</Text>
          </StyledToggleButton>
          <StyledToggleButton onClick={() => setWindowCaptureOpen(true)}>
            <GoBrowser color="white" size={20} />
            <Text color="white">Window</Text>
          </StyledToggleButton>
          <StyledToggleButton onClick={() => setDisplayCaptureOpen(true)}>
            <BsDisplay color="white" size={20} />
            <Text color="white">Screen</Text>
          </StyledToggleButton>
          <StyledToggleButton onClick={addText}>
            <TbTypography color="white" size={20} />
            <Text color="white">Text</Text>
          </StyledToggleButton>
        </Grid>
      </Container>
      <Container maxW="container.md" mb={3}>
        <Heading size="sm">Select Video Source</Heading>

        <Grid
          templateColumns={[
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
            'repeat(4, 1fr)',
            null,
          ]}
          gap={4}
          py={4}
        >
          <StyledToggleButton
            active={videoBackgroundMode === false}
            onClick={() => handleChangeVideoBackgroundMode(false)}
          >
            <Text color={videoBackgroundMode === false ? 'black' : 'white'}>
              Webcam
            </Text>
          </StyledToggleButton>
          <StyledToggleButton
            active={videoBackgroundMode === true}
            onClick={() => handleChangeVideoBackgroundMode(true)}
          >
            <Text color={videoBackgroundMode === true ? 'black' : 'white'}>
              Video / Gif
            </Text>
          </StyledToggleButton>
        </Grid>
      </Container>
      <Container maxW="container.md" mb={3}>
        <Heading size="sm">Select Audio Source</Heading>
        <Grid
          templateColumns={[
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
            'repeat(4, 1fr)',
            null,
          ]}
          gap={4}
          py={4}
        >
          <StyledToggleButton
            active={audioRecordModes.includes(AudioRecordMode.MICROPHONE)}
            onClick={() => {
              if (audioRecordModes.includes(AudioRecordMode.MICROPHONE)) {
                setAudioRecordModes(
                  audioRecordModes.filter(
                    (m) => m !== AudioRecordMode.MICROPHONE
                  )
                );
              } else {
                setAudioRecordModes([
                  ...audioRecordModes,
                  AudioRecordMode.MICROPHONE,
                ]);
              }
            }}
          >
            <Text
              color={
                audioRecordModes.includes(AudioRecordMode.MICROPHONE)
                  ? 'black'
                  : 'white'
              }
            >
              Microphone
            </Text>
          </StyledToggleButton>
          <StyledToggleButton
            active={audioRecordModes.includes(AudioRecordMode.MP3)}
            onClick={() => setUploadMp3Open(true)}
          >
            <BsPlus
              color={
                audioRecordModes.includes(AudioRecordMode.MP3)
                  ? 'black'
                  : 'white'
              }
              size={24}
            />
            <Text
              color={
                audioRecordModes.includes(AudioRecordMode.MP3)
                  ? 'black'
                  : 'white'
              }
              ml="0px !important"
            >
              MP3
            </Text>
          </StyledToggleButton>
          {/* <StyledToggleButton onClick={() => setYoutubeLinkOpen(true)}>
            <Text color="white">URL</Text>
          </StyledToggleButton> */}
          {platform === 'win32' && (
            <StyledToggleButton
              active={audioRecordModes.includes(AudioRecordMode.DESKTOP)}
              onClick={() => {
                if (audioRecordModes.includes(AudioRecordMode.DESKTOP)) {
                  setAudioRecordModes(
                    audioRecordModes.filter(
                      (m) => m !== AudioRecordMode.DESKTOP
                    )
                  );
                } else {
                  setAudioRecordModes([
                    ...audioRecordModes,
                    AudioRecordMode.DESKTOP,
                  ]);
                }
              }}
            >
              <Text
                color={
                  audioRecordModes.includes(AudioRecordMode.DESKTOP)
                    ? 'black'
                    : 'white'
                }
              >
                Desktop
              </Text>
            </StyledToggleButton>
          )}
        </Grid>
        <Flex direction="column" gap={3}>
          {mp3Items.map((mp3, i) => (
            <WaveformView
              audioElement={mp3}
              key={i}
              onRemove={() => {
                scene.current.removeMp3Item(i);
                scene.current.removePeaksInstances();
                if (scene.current.getMp3Items().length === 0) {
                  setAudioRecordModes(
                    audioRecordModes.filter((m) => m !== AudioRecordMode.MP3)
                  );
                }
                setRefresh((count) => count + 1);
              }}
            />
          ))}
        </Flex>
      </Container>
      <UploadMedia
        isOpen={uploadMediaOpen}
        onClose={() => setUploadMediaOpen(false)}
      />
      <UploadMp3
        isOpen={uploadMp3Open}
        onClose={() => setUploadMp3Open(false)}
      />
      <ColorPicker
        isOpen={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
      />
      <WindowCapture
        isOpen={windowCaptureOpen}
        onClose={() => setWindowCaptureOpen(false)}
      />
      <DisplayCapture
        isOpen={displayCaptureOpen}
        onClose={() => setDisplayCaptureOpen(false)}
      />
      <YoutubeLink
        isOpen={youtubeLinkOpen}
        onClose={() => setYoutubeLinkOpen(false)}
      />
      <UploadVideo
        isOpen={uploadVideoOpen}
        onClose={() => setUploadVideoOpen(false)}
      />
    </Flex>
  );
};

export default Studio;
