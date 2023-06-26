import { useEffect, useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Fade,
} from '@chakra-ui/react';
import { useCanvas } from 'renderer/contexts/CanvasContext';
import { useSetting } from 'renderer/contexts/SettingContext';
import { colors } from 'renderer/styles/theme';

import { BsCameraFill, BsStopCircle, BsCameraVideoFill } from 'react-icons/bs';
import { GrAdd } from 'react-icons/gr';
import StudioSharing from 'renderer/components/Modal/StudioSharing';
import mixpanel from 'mixpanel-browser';
import { useNFT } from 'renderer/contexts/NFTContext';
import {
  AudioRecordMode,
  useRecording,
} from 'renderer/contexts/RecordingContext';

const RecordButton = () => {
  const { canvasRef } = useCanvas();
  const { scene } = useNFT();
  const { audioRecordModes, recording, setRecording } = useRecording();
  const { selectedAudioInputDeviceID } = useSetting();
  const chunks = useRef([]);
  const recordingRef = useRef(false);
  const recorderRef = useRef<MediaRecorder>();
  const [timerID, setTimerID] = useState<NodeJS.Timeout>(null);
  const [screenshot, setScreenshot] = useState<string>();
  const [recordData, setRecordData] = useState<string>();
  const [socialSharingOpen, setSocialSharingOpen] = useState(false);
  const [shareable, setShareable] = useState(true); // If video > 10s, set to false

  useEffect(() => {
    if (!socialSharingOpen) {
      setScreenshot(null);
      setRecordData(null);
    }
  }, [socialSharingOpen]);

  const onCapture = async () => {
    if (canvasRef.current) {
      mixpanel.track('Media Created', {
        media_format: 'image',
      });
      const screenshotData = await canvasRef.current.toDataURL();
      setScreenshot(screenshotData as string);
      setSocialSharingOpen(true);
    }
  };

  const onRecord = async () => {
    if (!canvasRef.current) return;
    let canvasRecorder: MediaRecorder;
    if (recorderRef.current) {
      canvasRecorder = recorderRef.current;
    } else {
      // Initialize canvas recorder
      const canvasStream = canvasRef.current.captureStream(60);
      const audioContext = scene.current.getAudioContext();
      const gainNode = audioContext.createGain();
      const streamDestination = audioContext.createMediaStreamDestination();

      if (audioRecordModes.includes(AudioRecordMode.MICROPHONE)) {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: selectedAudioInputDeviceID,
            noiseSuppression: false,
            echoCancellation: false,
            autoGainControl: false,
          },
        });
        const source = audioContext.createMediaStreamSource(audioStream);
        const microphoneGainNode = audioContext.createGain();
        source.connect(microphoneGainNode);
        microphoneGainNode.connect(streamDestination);
      }
      if (audioRecordModes.includes(AudioRecordMode.DESKTOP)) {
        const audioStream = await (navigator.mediaDevices as any).getUserMedia({
          audio: {
            mandatory: {
              chromeMediaSource: 'desktop',
            },
          },
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
            },
          },
        });
        const source = audioContext.createMediaStreamSource(audioStream);
        const desktopGainNode = audioContext.createGain();
        source.connect(desktopGainNode);
        desktopGainNode.connect(streamDestination);
      }
      if (audioRecordModes.includes(AudioRecordMode.MP3)) {
        const sources = scene.current.getMp3SourceNodeItems();
        const peaksInstances = scene.current.getPeaksInstances();

        peaksInstances.forEach((peaks) => {
          const segment = peaks.segments.getSegment('trim-segment');
          if (segment.endTime - segment.startTime === 0) {
            peaks.player.play();
          } else {
            peaks.player.playSegment(segment, true);
          }
        });
        sources.forEach((source) => source.connect(gainNode));
      }
      gainNode.connect(streamDestination);
      gainNode.connect(audioContext.destination);
      const combinedStream = new MediaStream([
        ...canvasStream.getTracks(),
        ...streamDestination.stream.getTracks(),
      ]);

      const mimeType = 'video/webm';
      canvasRecorder = new MediaRecorder(combinedStream, {
        mimeType,
      });
      canvasRecorder.ondataavailable = (event) => {
        event.data.size && chunks.current.push(event.data);
      };
      canvasRecorder.onstop = () => {
        gainNode.disconnect();
        streamDestination.disconnect();
        if (chunks.current.length > 0) {
          const blob = new Blob(chunks.current);
          const dataURL = URL.createObjectURL(blob);
          setRecordData(dataURL);
        }
      };
    }
    // Start recorder
    if (!recordingRef.current) {
      mixpanel.time_event('record_video');
      canvasRecorder.start();
      setRecording(true);
      recordingRef.current = true;
      recorderRef.current = canvasRecorder;
    } else {
      const peaksInstances = scene.current.getPeaksInstances();
      peaksInstances.forEach((peaks) => peaks.player.pause());

      // Stop and dispose
      mixpanel.time_event('record_video');
      mixpanel.track('Media Created', {
        media_format: 'video',
      });
      setRecording(false);
      recordingRef.current = false;
      recorderRef.current = null;
      chunks.current = [];
      setSocialSharingOpen(true);
      canvasRecorder.stop();
      recorderRef.current = null;
      recordingRef.current = false;
      setTimerID(null);
    }
  };

  return (
    <>
      {!recording ? (
        <Fade in={!recording}>
          <Menu placement="top">
            <MenuButton
              zIndex={99}
              as={IconButton}
              aria-label="Options"
              icon={<GrAdd width="" color="white" />}
              variant="ghost"
              colorScheme="white"
              background={colors.brand.primary}
            />
            <MenuList>
              <MenuItem
                display="flex"
                justifyContent="center"
                color="black"
                onClick={onCapture}
                icon={<BsCameraFill />}
              >
                Take Photo
              </MenuItem>
              <MenuItem
                color="black"
                onClick={() => {
                  onRecord();
                  setShareable(true);
                  const timer = setTimeout(() => setShareable(false), 10000);
                  setTimerID(timer);
                }}
                icon={<BsCameraVideoFill />}
              >
                Record Video
              </MenuItem>
            </MenuList>
          </Menu>
        </Fade>
      ) : (
        <Fade in={recording}>
          <Box
            _hover={{
              cursor: 'pointer',
            }}
            onClick={() => {
              // Stop recording before timer hits 10 seconds
              onRecord();
              clearTimeout(timerID);
              setTimerID(null);
            }}
          >
            <BsStopCircle size={40} color="#E53E3E" />
          </Box>
        </Fade>
      )}

      <StudioSharing
        isOpen={socialSharingOpen}
        setIsOpen={setSocialSharingOpen}
        screenshot={screenshot}
        recordData={recordData}
        shareable={shareable}
      />
    </>
  );
};

export default RecordButton;
