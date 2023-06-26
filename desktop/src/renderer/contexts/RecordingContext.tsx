import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';

export enum AudioRecordMode {
  MP3,
  DESKTOP,
  MICROPHONE,
}

export interface RecordingContextProps {
  recording: boolean;
  setRecording: Dispatch<SetStateAction<boolean>>;
  audioRecordModes: AudioRecordMode[];
  setAudioRecordModes: Dispatch<SetStateAction<AudioRecordMode[]>>;
}

const RecordingContext = createContext<RecordingContextProps | null>(null);

export const useRecording = () => {
  return useContext(RecordingContext);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RecordingProvider = ({ children }: any) => {
  const [recording, setRecording] = useState(false);
  const [audioRecordModes, setAudioRecordModes] = useState([
    AudioRecordMode.MICROPHONE,
  ]);

  const value = {
    recording,
    setRecording,
    audioRecordModes,
    setAudioRecordModes,
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
};
