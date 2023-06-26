import localforage from 'localforage';
import { useEffect, createContext, useContext, useState } from 'react';
import { AudioAnalyser } from '@/utils/AudioAnalyser';

export interface SettingContextProps {
  hologramEnabled: boolean;
  lipsyncEnabled: boolean;
  handEnabled: boolean;
  bodyEnabled: boolean;
  audioSensitivity: number;
  audioAnalyser: AudioAnalyser;
  videoDevices: InputDeviceInfo[];
  audioInputDevices: InputDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  selectedVideoDeviceID: string;
  selectedAudioInputDeviceID: string;
  hasMicPermission: boolean;
  hasVideoPermission: boolean;
  enableCam: () => Promise<void>;
  enableMic: () => Promise<void>;
  setHologramEnabled: (enabled: boolean) => void;
  updateAudioSensitivity: (sensitivity: number) => void;
  toggleLipsync: (enabled: boolean) => void;
  toggleBody: (enabled: boolean) => void;
  updateVideoDevices: (newDevices: InputDeviceInfo[]) => void;
  updateAudioDevices: (newDevices: InputDeviceInfo[]) => void;
  selectVideoDeviceID: (deviceID: string) => void;
  selectAudioInputDeviceID: (deviceID: string) => void;
}

const SettingContext = createContext<SettingContextProps | null>(null);

export const useSetting = () => {
  return useContext(SettingContext);
};

export const SettingProvider = ({ children }: any) => {
  const [hologramEnabled, setHologramEnabled] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [hasVideoPermission, setHasVideoPermission] = useState(false);
  const [videoDevices, setVideoDevices] = useState<InputDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<InputDeviceInfo[]>(
    []
  );
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    MediaDeviceInfo[]
  >([]);
  const [selectedVideoDeviceID, setSelectedVideoDeviceID] =
    useState<string>('');
  const [selectedAudioInputDeviceID, setSelectedAudioInputDeviceID] =
    useState<string>('');
  const [audioAnalyser, setAudioAnalyser] = useState<AudioAnalyser>(
    new AudioAnalyser(1)
  );
  const [audioSensitivity, setAudioSensitivity] = useState(1);
  const [lipsyncEnabled, setLipsyncEnabled] = useState(false);
  const [handEnabled, setHandEnabled] = useState(false);
  const [bodyEnabled, setBodyEnabled] = useState(false);

  const initVideoDevices = async (hasPermission: boolean) => {
    if (hasPermission) {
      await getVideoDevices();
    }
  };

  const initAudioDevices = async (hasPermission: boolean) => {
    if (hasPermission) {
      await getAudioDevices();
    }
  };

  const getVideoDevices = async () => {
    const currDevices = await navigator.mediaDevices.enumerateDevices();
    const currVideoDevices = currDevices.filter(
      (d) => d.kind === 'videoinput' && !d.label.includes('Hologram Camera')
    );
    setVideoDevices(currVideoDevices);

    // Set selected video device
    const cachedVideoDeviceID: string = await localforage.getItem(
      'videoDeviceID'
    );
    if (
      cachedVideoDeviceID &&
      currVideoDevices.some((d) => d.deviceId === cachedVideoDeviceID)
    ) {
      setSelectedVideoDeviceID(cachedVideoDeviceID);
    } else {
      const currVideoDeviceIDs = currVideoDevices.map((d) => d.deviceId);
      if (currVideoDeviceIDs.length > 0) {
        setSelectedVideoDeviceID(currVideoDeviceIDs[0]);
      }
    }
  };

  const getAudioDevices = async () => {
    const currDevices = await navigator.mediaDevices.enumerateDevices();
    const currAudioInputDevices = currDevices.filter(
      (d) =>
        (!currDevices.some((d) => d.kind) && d.kind === 'audioinput') ||
        d.kind === 'audiooutput'
    );

    setAudioInputDevices(currAudioInputDevices);
    const currAudioOutputDevices = currDevices.filter(
      (d) => d.kind === 'audiooutput'
    );
    setAudioOutputDevices(currAudioOutputDevices);

    // Set selected audio device
    const cachedAudioDeviceID: string = await localforage.getItem(
      'audioDeviceID'
    );
    if (cachedAudioDeviceID) {
      setSelectedAudioInputDeviceID(cachedAudioDeviceID);
    } else {
      const currAudioDeviceIDs = currAudioInputDevices.map((d) => d.deviceId);
      if (currAudioDeviceIDs.length > 0) {
        setSelectedAudioInputDeviceID(currAudioDeviceIDs[0]);
      }
    }
  };

  useEffect(() => {
    (async () => {
      // Check if user has given video permission
      // TODO: add audio
      const videoPermitted = await checkPermissions('videoinput');
      setHasVideoPermission(videoPermitted);

      await initVideoDevices(videoPermitted);
      navigator.mediaDevices.ondevicechange = () => {
        getVideoDevices();
      };

      // Set audio sensitivity
      // const cachedAudioSensitivity: number = await localforage.getItem(
      //   'audioSensitivity'
      // );
      // if (cachedAudioSensitivity) {
      //   setAudioSensitivity(cachedAudioSensitivity);
      // }

      // Set lipsync enabled
      // const cachedLipsyncEnabled: boolean = await localforage.getItem(
      //   'lipsyncEnabled'
      // );
      // if (cachedLipsyncEnabled) {
      //   setLipsyncEnabled(cachedLipsyncEnabled);
      // }
    })();
  }, []);

  // Check permission of audioinput or videoinput
  const checkPermissions = async (type: string) => {
    const currDevices = await navigator.mediaDevices.enumerateDevices();
    return currDevices.some((val) => val.kind === type && val.label !== '');
  };

  const updateVideoDevices = (newDevices: InputDeviceInfo[]) => {
    setVideoDevices(newDevices);
  };

  const updateAudioDevices = (newDevices: InputDeviceInfo[]) => {
    setAudioInputDevices(newDevices);
  };

  const enableMic = async () => {
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    await getAudioDevices();
    setHasMicPermission(true);
  };

  const enableCam = async () => {
    await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    await getVideoDevices();
    setHasVideoPermission(true);
  };

  const selectVideoDeviceID = (deviceID: string) => {
    setSelectedVideoDeviceID(deviceID);
    localforage.setItem('videoDeviceID', deviceID);
  };

  const selectAudioInputDeviceID = (deviceID: string) => {
    const newAudioAnalyser = new AudioAnalyser(audioSensitivity);
    navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: deviceID },
        video: false,
      })
      .then((stream) => {
        newAudioAnalyser.connectSource(stream);
        setAudioAnalyser(newAudioAnalyser);
      });
    setSelectedAudioInputDeviceID(deviceID);
    localforage.setItem('audioDeviceID', deviceID);
  };

  const updateAudioSensitivity = (sensitivity: number) => {
    setAudioSensitivity(sensitivity);
    audioAnalyser.updateSensitivityFactor(sensitivity);
    localforage.setItem('audioSensitivity', sensitivity);
  };

  const toggleLipsync = (enabled: boolean) => {
    setLipsyncEnabled(enabled);
    localforage.setItem('lipsyncEnabled', enabled);
  };

  const toggleBody = (enabled: boolean) => {
    setBodyEnabled(enabled);
    localforage.setItem('bodyEnabled', enabled);
  };

  const value = {
    hologramEnabled,
    lipsyncEnabled,
    handEnabled,
    bodyEnabled,
    audioSensitivity,
    audioAnalyser,
    videoDevices,
    audioInputDevices,
    audioOutputDevices,
    selectedVideoDeviceID,
    selectedAudioInputDeviceID,
    hasMicPermission,
    hasVideoPermission,
    enableCam,
    enableMic,
    setHologramEnabled,
    updateAudioSensitivity,
    toggleLipsync,
    toggleBody,
    updateVideoDevices,
    updateAudioDevices,
    selectVideoDeviceID,
    selectAudioInputDeviceID,
  };
  return (
    <SettingContext.Provider value={value}>{children}</SettingContext.Provider>
  );
};
