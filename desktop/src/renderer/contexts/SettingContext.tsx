import localforage from 'localforage';
import { useEffect, createContext, useContext, useState } from 'react';
import { AudioAnalyser } from 'renderer/utils/audioAnalyser';

export interface SettingContextProps {
  hologramEnabled: boolean;
  lipsyncEnabled: boolean;
  cameraMirrored: boolean;
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
  stabilizeEnabled: boolean;
  showFPS: boolean;
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
  setCameraMirrored: (mirrored: boolean) => void;
  toggleStability: (enabled: boolean) => void;
  setShowFPS: (enabled: boolean) => void;
}

const SettingContext = createContext<SettingContextProps | null>(null);

export const useSetting = () => {
  return useContext(SettingContext);
};

export const SettingProvider = ({ children }: any) => {
  const [hologramEnabled, setHologramEnabled] = useState(true);
  const [stabilizeEnabled, setStabilizeEnabled] = useState(false);
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
  const [selectedAudioInputDeviceID, setselectedAudioInputDeviceID] =
    useState<string>('');
  const [audioAnalyser, setAudioAnalyser] = useState<AudioAnalyser>(
    new AudioAnalyser(1)
  );
  const [audioSensitivity, setAudioSensitivity] = useState(1);
  const [lipsyncEnabled, setLipsyncEnabled] = useState(false);
  const [handEnabled, setHandEnabled] = useState(false);
  const [bodyEnabled, setBodyEnabled] = useState(false);
  const [cameraMirrored, setCameraMirrored] = useState(false);
  const [showFPS, setShowFPS] = useState(false);

  const initVideoDevices = async () => {
    if (hasVideoPermission) {
      await getVideoDevices();
    }
  };

  const initAudioDevices = async () => {
    if (hasMicPermission) {
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
    if (cachedVideoDeviceID) {
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
        (!currDevices.some((t) => t.kind) && d.kind === 'audioinput') ||
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
      setselectedAudioInputDeviceID(cachedAudioDeviceID);
    } else {
      const currAudioDeviceIDs = currAudioInputDevices.map((d) => d.deviceId);
      if (currAudioDeviceIDs.length > 0) {
        setselectedAudioInputDeviceID(currAudioDeviceIDs[0]);
      }
    }
  };

  useEffect(() => {
    (async () => {
      // Check if user has given mic permission
      const micPermitted = await checkPermissions('audioinput');
      setHasMicPermission(micPermitted);
      const videoPermitted = await checkPermissions('videoinput');
      setHasVideoPermission(videoPermitted);

      navigator.mediaDevices.ondevicechange = () => {
        initVideoDevices();
        initAudioDevices();
      };

      // Set audio sensitivity
      const cachedAudioSensitivity: number = await localforage.getItem(
        'audioSensitivity'
      );
      if (cachedAudioSensitivity) {
        setAudioSensitivity(cachedAudioSensitivity);
      }

      // Set lipsync enabled
      const cachedLipsyncEnabled: boolean = await localforage.getItem(
        'lipsyncEnabled'
      );
      if (cachedLipsyncEnabled) {
        setLipsyncEnabled(cachedLipsyncEnabled);
      }

      // Set stability enabled
      const cachedStabilityEnabled: boolean = await localforage.getItem(
        'stabilityEnabled'
      );
      if (cachedStabilityEnabled) {
        setStabilizeEnabled(cachedStabilityEnabled);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (hasVideoPermission) {
        await initVideoDevices();
      }
    })();
  }, [hasVideoPermission]);

  useEffect(() => {
    (async () => {
      if (hasMicPermission) {
        await initAudioDevices();
      }
    })();
  }, [hasMicPermission]);

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
    setselectedAudioInputDeviceID(deviceID);
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

  const toggleStability = (enabled: boolean) => {
    setStabilizeEnabled(enabled);
    localforage.setItem('stabilityEnabled', enabled);
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
    stabilizeEnabled,
    showFPS,
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
    cameraMirrored,
    setCameraMirrored,
    toggleStability,
    setShowFPS,
  };
  return (
    <SettingContext.Provider value={value}>{children}</SettingContext.Provider>
  );
};
