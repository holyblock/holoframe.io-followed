import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  FormControl,
  Select,
  Heading,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Progress,
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  Switch,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { colors } from 'renderer/styles/theme';
import { useSetting } from 'renderer/contexts/SettingContext';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import CustomButton from 'renderer/components/Button';
import grainTexture from '../../../../assets/img/grain.svg';

const Settings = () => {
  const {
    enableCam,
    enableMic,
    audioAnalyser,
    audioSensitivity,
    updateAudioSensitivity,
    videoDevices,
    selectVideoDeviceID,
    selectedVideoDeviceID,
    audioInputDevices,
    audioOutputDevices,
    selectAudioInputDeviceID,
    selectedAudioInputDeviceID,
    lipsyncEnabled,
    toggleLipsync,
    hologramEnabled,
    setHologramEnabled,
    cameraMirrored,
    setCameraMirrored,
    hasMicPermission,
    hasVideoPermission,
    stabilizeEnabled,
    toggleStability,
    showFPS,
    setShowFPS,
  } = useSetting();
  const [volume, setVolume] = useState(0);
  const [lipsyncOn, setLipsyncOn] = useState(lipsyncEnabled);
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);

  useEffect(() => {
    (async () => {
      // Display volume level
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedAudioInputDeviceID },
        video: false,
      });
      audioAnalyser.connectSource(stream);
      const onFrame = () => {
        const currVolume = audioAnalyser.getVolume();
        setVolume(currVolume);
        requestAnimationFrame(onFrame);
      };
      const id = requestAnimationFrame(onFrame);
      return () => cancelAnimationFrame(id);
    })();
  }, [selectedAudioInputDeviceID]);

  useEffect(() => {
    toggleLipsync(lipsyncOn);
  }, [lipsyncOn]);

  // Handle enable or disable Hologram
  const onEnableHologramToggleChange = (e: any) => {
    if (!e.target.checked) {
      setIsModelPopupOpen(true);
    } else {
      onEnableOrDisable(true);
    }
  };
  const onEnableOrDisable = (action: any) => {
    setHologramEnabled(action);
    setIsModelPopupOpen(false);
  };

  const handleVideoDeviceChange = (event: any) => {
    selectVideoDeviceID(event.target.value);
  };

  const handleAudioInputDeviceChange = (event: any) => {
    selectAudioInputDeviceID(event.target.value);
  };

  const renderCameras = videoDevices.map((d: InputDeviceInfo) => {
    return (
      <option
        key={d.deviceId}
        value={d.deviceId}
        onSelect={handleVideoDeviceChange}
      >
        {d.label}
      </option>
    );
  });

  const renderAudioInput = audioInputDevices.map((d: InputDeviceInfo) => {
    return (
      <option
        key={d.deviceId}
        value={d.deviceId}
        onSelect={handleAudioInputDeviceChange}
      >
        {d.label}
      </option>
    );
  });

  const onLipsyncToggleChange = (e: any) => {
    if (!e.target.checked) {
      setLipsyncOn(false);
    } else {
      setLipsyncOn(true);
    }
  };

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      zIndex={97}
      textAlign="center"
      my={3}
    >
      <Box>
        {hasVideoPermission ? (
          <>
            <Heading size="sm" mb={1}>
              Choose your camera
            </Heading>
            <Select
              variant="flushed"
              onChange={handleVideoDeviceChange}
              value={selectedVideoDeviceID}
              _hover={{
                cursor: 'pointer',
              }}
            >
              {renderCameras}
            </Select>
          </>
        ) : (
          <>
            <Heading size="sm" mb={1}>
              Enable your camera
            </Heading>
            <Flex
              mt={5}
              rounded="md"
              color="white"
              h="30px"
              alignItems="center"
              justifyContent="center"
              outline="2px solid white"
              _hover={{
                opacity: 1,
                cursor: 'pointer',
                outline: `2px solid ${colors.brand.primary}`,
                color: colors.brand.primary,
              }}
              onClick={enableCam}
            >
              <HStack h="100%" justifyContent="center">
                <Text color="white">Enable</Text>
              </HStack>
            </Flex>
          </>
        )}
        {hasMicPermission ? (
          <>
            <Heading size="sm" mt={10}>
              Choose your microphone
            </Heading>
            <Select
              variant="flushed"
              onChange={handleAudioInputDeviceChange}
              value={selectedAudioInputDeviceID}
              _hover={{
                cursor: 'pointer',
              }}
            >
              {renderAudioInput}
            </Select>
            <Progress
              colorScheme="red"
              mt={5}
              value={volume}
              max={1}
              size="xs"
            />
          </>
        ) : (
          <>
            <Heading size="sm" mt={10}>
              Enable your microphone
            </Heading>
            <Flex
              mt={5}
              rounded="md"
              color="white"
              h="30px"
              alignItems="center"
              justifyContent="center"
              outline="2px solid white"
              _hover={{
                opacity: 1,
                cursor: 'pointer',
                outline: `2px solid ${colors.brand.primary}`,
                color: colors.brand.primary,
              }}
              onClick={enableMic}
            >
              <HStack h="100%" justifyContent="center">
                <Text color="white">Enable</Text>
              </HStack>
            </Flex>
          </>
        )}
        <Heading size="sm" mt={10}>
          General Settings
        </Heading>
        <Flex
          w="100%"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Text whiteSpace="nowrap" mr={3} fontSize="sm" fontWeight="bold">
            Audio Sensitivity
          </Text>
          <Slider
            isDisabled={!hasMicPermission}
            colorScheme="colors"
            value={audioSensitivity}
            defaultValue={audioSensitivity}
            onChange={updateAudioSensitivity}
            onChangeEnd={updateAudioSensitivity}
            min={0}
            max={5}
            mr={8}
          >
            <SliderTrack>
              <SliderFilledTrack bg={colors.brand.primary} />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text textAlign="center">{audioSensitivity}</Text>
        </Flex>
        <Flex
          w="100%"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Text whiteSpace="nowrap" mr={3} fontSize="sm" fontWeight="bold">
            Lip Sync
          </Text>
          <Tooltip label="Open and close avatar mouth according to input audio volume, determined by audio sensitivity">
            <InfoOutlineIcon />
          </Tooltip>
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="right"
          >
            <Switch
              defaultChecked={lipsyncOn}
              id="lipsync-enable"
              isChecked={lipsyncOn}
              onChange={onLipsyncToggleChange}
              colorScheme="colors"
              mr={3}
            />
            <Text>{lipsyncEnabled ? 'On' : 'Off'}</Text>
          </FormControl>
        </Flex>
        <Flex
          w="100%"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Text whiteSpace="nowrap" mr={3} fontSize="sm" fontWeight="bold">
            Virtual Feed
          </Text>
          <Tooltip label="Enable or disable virtual avatar feed">
            <InfoOutlineIcon />
          </Tooltip>
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="right"
          >
            <Switch
              defaultChecked={hologramEnabled}
              id="hologram-enable"
              isChecked={hologramEnabled}
              onChange={onEnableHologramToggleChange}
              colorScheme="colors"
              mr={3}
            />
            <Text>{hologramEnabled ? 'On' : 'Off'}</Text>
          </FormControl>
        </Flex>
        <Flex
          w="100%"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Text whiteSpace="nowrap" mr={3} fontSize="sm" fontWeight="bold">
            Stabilize
          </Text>
          <Tooltip label="Fix avatar's body movement in place">
            <InfoOutlineIcon />
          </Tooltip>
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="right"
          >
            <Switch
              defaultChecked={stabilizeEnabled}
              id="hologram-enable"
              isChecked={stabilizeEnabled}
              onChange={() => toggleStability(!stabilizeEnabled)}
              colorScheme="colors"
              mr={3}
            />
            <Text>{stabilizeEnabled ? 'On' : 'Off'}</Text>
          </FormControl>
        </Flex>

        <Flex
          w="100%"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Text whiteSpace="nowrap" mr={3} fontSize="sm" fontWeight="bold">
            Mirror camera
          </Text>
          <Tooltip label="Enable or disable scene mirroring">
            <InfoOutlineIcon />
          </Tooltip>
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="right"
          >
            <Switch
              defaultChecked={cameraMirrored}
              id="hologram-enable"
              isChecked={cameraMirrored}
              onChange={() => setCameraMirrored(!cameraMirrored)}
              colorScheme="colors"
              mr={3}
            />
            <Text>{cameraMirrored ? 'On' : 'Off'}</Text>
          </FormControl>
        </Flex>
        <Flex
          w="100%"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Text whiteSpace="nowrap" mr={3} fontSize="sm" fontWeight="bold">
            FPS Monitor
          </Text>
          <Tooltip label="Show/Hide FPS Monitor">
            <InfoOutlineIcon />
          </Tooltip>
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="right"
          >
            <Switch
              defaultChecked={showFPS}
              id="show-fps"
              isChecked={showFPS}
              onChange={() => setShowFPS(!showFPS)}
              colorScheme="colors"
              mr={3}
            />
            <Text>{showFPS ? 'On' : 'Off'}</Text>
          </FormControl>
        </Flex>
      </Box>
      <Modal
        isOpen={isModelPopupOpen}
        onClose={() => setIsModelPopupOpen(false)}
        isCentered
        size="sm"
      >
        <ModalOverlay />
        <ModalContent
          bg={colors.brand.tertiary}
          bgImg={grainTexture}
          p="20px"
          color="white"
        >
          <ModalBody w="100%" display="flex" flexDir="row">
            <Text fontSize="md">
              Are you sure you want to turn off Hologram? Your face will be
              revealed.
            </Text>
          </ModalBody>
          <ModalFooter w="100%">
            <Box pr={1} w="100%">
              <CustomButton
                text="Cancel"
                variant="outline"
                secondaryColor="white"
                onClick={() => setIsModelPopupOpen(false)}
              />
            </Box>
            <Box pl={1} w="100%">
              <CustomButton
                text="Proceed"
                variant="solid"
                color={colors.brand.primary}
                onClick={() => onEnableOrDisable(false)}
              />
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Settings;
