import {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
// import FaceModel from '@/utils/FaceModel';
import BodyModel from '@/utils/BodyModel';
import config from '../../../utils/config';
import { useCanvas } from '@/contexts/CanvasContext';
import { useSetting } from './SettingContext';
// import { faceKey } from 'renderer/settings';

export interface TrackingContextProps {
  //faceModel: MutableRefObject<FaceModel | null>;
  bodyModel: MutableRefObject<BodyModel | null>;
  faceTrackingEnabled: boolean;
  handTrackingEnabled: boolean;
  predictFunc: MutableRefObject<any>;
  initFaceTracking: () => void;
  //stopFaceTracking: () => void;
  initHandTracking: () => void;
  stopHandTracking: () => void;
}

const TrackingContext = createContext<TrackingContextProps | null>(null);

export const useTracking = () => {
  return useContext(TrackingContext);
};

export const TrackingProvider = ({ children }) => {
  // const outputCanvas = useStore((state) => state.outputCanvas);
  // const faceModel = useRef<FaceModel | null>(null);
  const bodyModel = useRef<BodyModel | null>(null);
  const predictFunc = useRef<any>(null);
  const mediaStream = useRef<any>(null);
  const [faceTrackingEnabled, setFaceTrackingEnabled] = useState(false);
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const { videoRef } = useCanvas();
  const { selectedVideoDeviceID, selectedAudioInputDeviceID } = useSetting();

  // Re-initialize face tracking upon device change
  useEffect(() => {
    if (faceTrackingEnabled) {
      initFaceTracking();
    }
  }, [selectedVideoDeviceID, selectedAudioInputDeviceID]);

  const initFaceTracking = () => {
    // Start face model
    setFaceTrackingEnabled(true);
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
        // audio: {
        //   deviceId: selectedAudioDeviceID,
        // },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(async (stream) => {
          mediaStream.current = stream;
          videoRef.current.srcObject = stream;
          await videoRef.current?.play();
        })
        .catch((e) => {
          console.error(e);
        });

      //   if (!faceModel.current) {
      //     //const model = new FaceModel('iuw27ggiwnyvfs6flhcctw65ef2e5cdhmaab223xu6fyc6xw5obh3ei', videoRef.current);
      //     //faceModel.current = model;
      //     predictFunc.current = model.prediction;
      //   }
      // } else {
      //   mediaStream.current?.getTracks().forEach(t => {
      //     t.enabled = true;
      //   })
    }

    //faceModel.current.startProcess();
  };

  // const stopFaceTracking = () => {
  //   if (faceModel.current) {
  //     faceModel.current.stopProcess();
  //     mediaStream.current.getTracks().forEach(t => {
  //       t.enabled = false;
  //     })
  //     setFaceTrackingEnabled(false);
  //   }
  // };

  const initAudioInput = () => {
    const constraints = {
      audio: {
        deviceId: selectedAudioInputDeviceID,
      },
    };
    navigator.mediaDevices.getUserMedia(constraints);
  };

  const initHandTracking = () => {
    setHandTrackingEnabled(true);
    bodyModel.current = new BodyModel(videoRef.current);
  };

  const stopHandTracking = () => {
    setHandTrackingEnabled(false);
    if (bodyModel.current) {
      bodyModel.current.stopProcess();
      bodyModel.current = null;
    }
  };

  const value = {
    //faceModel,
    bodyModel,
    faceTrackingEnabled,
    handTrackingEnabled,
    predictFunc,
    initFaceTracking,
    //stopFaceTracking,
    initHandTracking,
    stopHandTracking,
  };
  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};
