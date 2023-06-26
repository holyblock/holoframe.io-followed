import {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AlterFaceModel from 'renderer/utils/alterFaceModel';
import HoloBodyModel from 'renderer/utils/holoBodyModel';
import { faceKey } from 'renderer/settings';
import config from '../../../../utils/config';
import { useCanvas } from './CanvasContext';
import { useSetting } from './SettingContext';
import { usePreviewMedia } from './PreviewMediaContext';
import { useNFT } from './NFTContext';

export interface TrackingContextProps {
  faceModel: MutableRefObject<AlterFaceModel | null>;
  bodyModel: MutableRefObject<HoloBodyModel | null>;
  faceTrackingEnabled: boolean;
  handTrackingEnabled: boolean;
  AREnabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  predictFunc: MutableRefObject<any>;
  setFaceTrackingEnabled: (value: boolean) => void;
  initFaceTracking: (isVideoMode?: boolean) => void;
  stopFaceTracking: () => void;
  initHandTracking: () => void;
  stopHandTracking: () => void;
  setAREnabled: (value: boolean) => void;
}

const TrackingContext = createContext<TrackingContextProps | null>(null);

export const useTracking = () => {
  return useContext(TrackingContext);
};

export const TrackingProvider = ({ children }) => {
  const faceModel = useRef<AlterFaceModel | null>(null);
  const bodyModel = useRef<HoloBodyModel | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const predictFunc = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mediaStream = useRef<any>(null);
  const [faceTrackingEnabled, setFaceTrackingEnabled] = useState(false);
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const [AREnabled, setAREnabled] = useState(false);
  const { videoRef } = useCanvas();
  const { previewMediaDataUrl } = usePreviewMedia();
  const { selectedVideoDeviceID, selectedAudioInputDeviceID } = useSetting();
  const { videoBackgroundMode } = useNFT();

  // Re-initialize face tracking upon device change
  useEffect(() => {
    if (faceTrackingEnabled) {
      initFaceTracking(videoBackgroundMode);
    } else {
      stopFaceTracking();
    }
  }, [
    selectedVideoDeviceID,
    selectedAudioInputDeviceID,
    faceTrackingEnabled,
    videoBackgroundMode,
    previewMediaDataUrl,
  ]);

  const initFaceTracking = async (isVideoMode: boolean) => {
    if (isVideoMode && !previewMediaDataUrl) {
      return;
    }
    if (!isVideoMode) {
      if (!mediaStream.current) {
        const constraints = {
          video: {
            deviceId: selectedVideoDeviceID,
            width: {
              max: config.video.videoWidth,
              min: config.video.videoWidth,
            },
            height: {
              max: config.video.videoHeight,
              min: config.video.videoHeight,
            },
          },
          audio: {
            deviceId: selectedAudioInputDeviceID,
          },
        };
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(async (stream) => {
            mediaStream.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current?.play();
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.error(e);
          });
      } else {
        mediaStream.current.getTracks().forEach((t) => {
          t.enabled = true;
        });

        videoRef.current.srcObject = mediaStream.current;
        await videoRef.current?.play();
      }
    }

    if (!faceModel.current) {
      const model = new AlterFaceModel(faceKey, videoRef.current);
      faceModel.current = model;
      predictFunc.current = model.prediction;
    }

    faceModel.current.startProcess();
  };

  const stopFaceTracking = () => {
    if (faceModel?.current) {
      faceModel.current.stopProcess();
    }

    if (mediaStream.current && videoBackgroundMode === false) {
      mediaStream.current.getTracks().forEach((t) => {
        t.enabled = false;
      });
    }
  };

  const initHandTracking = () => {
    setHandTrackingEnabled(true);
    bodyModel.current = new HoloBodyModel(videoRef.current);
  };

  const stopHandTracking = () => {
    setHandTrackingEnabled(false);
    if (bodyModel.current) {
      bodyModel.current.stopProcess();
      bodyModel.current = null;
    }
  };

  const value = {
    faceModel,
    bodyModel,
    faceTrackingEnabled,
    handTrackingEnabled,
    AREnabled,
    predictFunc,
    setFaceTrackingEnabled,
    initFaceTracking,
    stopFaceTracking,
    initHandTracking,
    stopHandTracking,
    setAREnabled,
  };
  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};
