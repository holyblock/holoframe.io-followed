import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  CloseButton,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { RxReset } from 'react-icons/rx';
import { BsFillCameraVideoFill, BsCameraVideoOffFill } from 'react-icons/bs';
import { Tb3DCubeSphere, TbHandStop, TbHandOff } from 'react-icons/tb';
import Fullscreen from 'react-fullscreen-crossbrowser';
import { useNFT } from 'renderer/contexts/NFTContext';
import { useSetting } from 'renderer/contexts/SettingContext';
import { colors } from 'renderer/styles/theme';
import { Size } from 'renderer/types/types';
import useWindowSize from 'renderer/hooks/useWindowSize';
import { useCanvas } from 'renderer/contexts/CanvasContext';
import useVCam from 'renderer/hooks/useVCam';
import { useTracking } from 'renderer/contexts/TrackingContext';
import { useTextEditor } from 'renderer/contexts/TextEditorContext';
import { AnimationGenerator } from '../../utils/animationGenerator';
import { AvatarModel, NFTMetadata } from '../../types';
import { projectConfig } from '../../config/display';
import { handleLive2dZip } from '../../utils/fileHandler';
import { Live2dModel } from '../../utils/live2dModel';
import { GLTFModel } from '../../utils/gltfModel';
import { VRMModel } from '../../utils/vrmModel';

import config from '../../../../../utils/config';
import AvatarDraggable from '../Draggable/AvatarDraggable';
import ItemDraggable from '../Draggable/ItemDraggable';
import PreviewMedia from './PreviewMedia';
import TextEditorModal from '../Modal/TextEditorModal';
import FPSMonitor from '../FPSMonitor';

export interface HomeProps {
  // apiKey: string;
  uploadEnabled?: boolean;
  trackingMode?: string; // 'face', 'mouse', 'animation', 'none'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationSequence?: any; // only applies when trackingMode is 'animation'
}

const Preview = (props: HomeProps) => {
  const { trackingMode, animationSequence } = props;
  const { updateVCam } = useVCam();
  const {
    hologramEnabled,
    audioAnalyser,
    lipsyncEnabled,
    stabilizeEnabled,
    showFPS,
    cameraMirrored,
  } = useSetting();
  const {
    bodyModel,
    predictFunc,
    faceTrackingEnabled,
    handTrackingEnabled,
    AREnabled,
    setFaceTrackingEnabled,
    initHandTracking,
    stopHandTracking,
    setAREnabled,
  } = useTracking();

  const {
    avatarModel,
    selectedHologram,
    initialized,
    scene,
    setAvatarModel,
    setExpressions,
    placement,
    setPlacement,
    zoomFactor,
    setZoomFactor,
    videoBackgroundMode,
  } = useNFT();

  const {
    canvasRef,
    videoRef,
    pictureInPictureRef,
    fullscreenEnabled,
    setFullscreenEnabled,
    setRealtimeFPS,
  } = useCanvas();

  const {
    windowSize,
    canvasSize,
    setCanvasSize,
    canvasRatio,
    previewScreenSize,
  } = useWindowSize();

  const { showEditorModal, setShowEditorModal } = useTextEditor();

  const [modelEnabled, setModelEnabled] = useState(false);
  const [modelType, setModelType] = useState('live2d');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(1);

  const loading = useRef<boolean>(true);
  const modelEnabledRef = useRef<boolean>(false);
  const AREnabledRef = useRef<boolean>(false);
  const hologramEnabledRef = useRef<boolean>(false);
  const avatarModelRef = useRef<AvatarModel | null>(null);
  const videoModeRef = useRef<boolean>(videoBackgroundMode);
  const animationGenerator = useRef<AnimationGenerator | null>(null);
  const cameraMirroredRef = useRef<boolean>(cameraMirrored);

  const canvasWidth = useMemo(
    () =>
      Math.min(
        windowSize.width / (videoBackgroundMode ? 2 : 1),
        previewScreenSize
      ),
    [windowSize, previewScreenSize, videoBackgroundMode]
  );

  const canvasHeight = useMemo(
    () => canvasWidth * canvasRatio,
    [canvasWidth, canvasRatio]
  );

  const lipsyncEnabledRef = useRef(lipsyncEnabled);

  const loadingImg = new Image();
  loadingImg.crossOrigin = 'anonymous';
  loadingImg.src = config.assets.placeholder;
  const placeholderImg = new Image();
  placeholderImg.crossOrigin = 'anonymous';
  placeholderImg.src = config.assets.placeholder;

  useEffect(() => {
    modelEnabledRef.current = modelEnabled;
    hologramEnabledRef.current = hologramEnabled;
    lipsyncEnabledRef.current = lipsyncEnabled;
    AREnabledRef.current = AREnabled;
    cameraMirroredRef.current = cameraMirrored;
  }, [
    modelEnabled,
    hologramEnabled,
    lipsyncEnabled,
    AREnabled,
    cameraMirrored,
  ]);

  // Handle mouse movement tracking for Avatar
  const updateAvatarLookPosition = useCallback(
    // plain event, not a React synthetic event
    ({ clientX: xPosition, clientY: yPosition }) => {
      if (avatarModel) {
        const relativeX = xPosition / window.innerWidth;
        const relativeY = yPosition / window.innerHeight;
        avatarModelRef.current?.lookAt(relativeX, relativeY);
      }
    },
    []
  );

  // Initialize video feed and any available tracking for Avatar
  useEffect(() => {
    if (!videoRef || !videoRef.current || !loading.current || modelEnabled)
      return;
    if (videoRef && videoRef.current && !modelEnabled) {
      if (trackingMode === 'animation') {
        const currAnimationGenerator = new AnimationGenerator();
        currAnimationGenerator.loadData(animationSequence);
        animationGenerator.current = currAnimationGenerator;
        predictFunc.current = currAnimationGenerator.prediction; // Set predict function
      }

      if (trackingMode === 'mouse') {
        window.addEventListener('mousemove', updateAvatarLookPosition);
      }
      setModelEnabled(true);
      videoRef.current.muted = true;
      videoRef.current?.play();
    }
  }, [videoRef.current, loading.current, modelEnabled, trackingMode]);

  // Handle Avatar selection
  useEffect(() => {
    (async () => {
      if (initialized && modelEnabled && hologramEnabled) {
        setExpressions(new Map());
        await loadModel(selectedHologram);
      }
    })();
  }, [initialized, modelEnabled, hologramEnabled, selectedHologram]);

  const loadModel = async (modelData: NFTMetadata) => {
    if (!modelData) return;
    loading.current = true;
    setModelType(modelData.type);
    // Load config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const localConfig = (projectConfig as any)[modelData.project];
    if (modelData.type === 'live2d') {
      // Disable ongoing 3D-only features like hand tracking
      if (handTrackingEnabled) stopHandTracking();
      try {
        // Get encoded live2d data from zip
        const live2dData = await handleLive2dZip(modelData.model_url);
        const encodedModelData = live2dData.model;
        encodedModelData.url = '';

        // Store expression data
        const expData = live2dData.expressions;
        if (expData?.size > 0) {
          setExpressions(expData);
        }

        // Load model
        const model = new Live2dModel(
          expData,
          zoomFactor,
          {
            width: canvasWidth,
            height: canvasHeight,
          },
          null,
          config
        );
        await model.loadFile(encodedModelData);
        avatarModelRef.current = model;
        setAvatarModel(model);

        // Expose live2d model to animation generator, if it exists
        if (animationGenerator.current) {
          animationGenerator.current.registerLive2dModel(model);
        }
      } catch (e) {
        loading.current = false;
        setError('There was an issue displaying your model.');
      }
    } else if (modelData.type === '3d') {
      let model: AvatarModel | null = null;
      const fileExtension =
        modelData.format ?? modelData.model_url?.split('.').pop();

      if (fileExtension === 'glb') {
        // GLTF model
        model = new GLTFModel(canvasRef.current, localConfig);
      } else if (fileExtension === 'vrm') {
        model = new VRMModel(canvasRef.current, localConfig);
      }
      if (model) {
        await model.loadFile(modelData.model_url);
        avatarModelRef.current = model;
        setAvatarModel(model);
      }
    }

    setAvatarModel(avatarModelRef.current);
    loading.current = false;
    canvasRef.current.id = 'output-canvas';

    // Set display canvas size
    const newCanvasSize: Size = {
      width: canvasWidth,
      height: canvasHeight,
    };
    setCanvasSize(newCanvasSize);
    scene.current.setCanvasSize(newCanvasSize);
    animationGenerator.current?.resetSequence();
  };

  // Method for drawing and writing frame to virtual cam
  const drawFrame = () => {
    const startTime = performance.now();
    if (
      hologramEnabledRef.current === true &&
      modelEnabledRef.current === true &&
      (avatarModelRef || scene.current?.hasItems())
    ) {
      if (loading.current === true) {
        // Before face model loaded, display loading screen
        canvasRef.current
          ?.getContext('2d')
          .drawImage(
            loadingImg,
            0,
            0,
            config.video.videoWidth,
            config.video.videoHeight
          );
      } else {
        if (avatarModelRef.current && AREnabledRef.current) {
          // Display original video
          const { videoWidth: width, videoHeight: height } = config.video;
          const { videoWidth, videoHeight } = videoRef.current;

          const ctx = canvasRef.current?.getContext('2d');
          ctx.save();
          // AR background video element should be flipped by default
          if (!cameraMirroredRef.current) {
            ctx.translate(1280, 0);
            ctx.scale(-1, 1);
          }
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, width, height);

          const r = width / height;
          const vr = videoWidth / videoHeight;
          const dh = vr > r ? width / vr : height;
          const dw = vr > r ? width : vr * height;
          const dx = vr > r ? 0 : (width - dw) / 2;
          const dy = vr > r ? (height - dh) / 2 : 0;

          ctx.drawImage(videoRef.current, dx, dy, dw, dh);
          ctx.restore();
        }

        const context = canvasRef.current?.getContext('2d');
        context.save();

        if (cameraMirroredRef.current) {
          context.translate(config.video.videoWidth, 0);
          context.scale(-1, 1);
        }
        // Display scenes
        scene.current?.display(canvasRef.current, context);
        // Display avatar
        if (avatarModelRef.current) {
          // Apply lip syncing
          if (lipsyncEnabledRef.current) {
            avatarModelRef.current?.updateLipSync(audioAnalyser.getVolume());
          }

          // Apply face and body capture
          let facePredictions = null;
          let bodyPredictions = null;
          if (predictFunc?.current) {
            facePredictions = predictFunc?.current?.call();
          }
          if (bodyModel.current) {
            bodyPredictions = bodyModel.current.prediction();
          }
          avatarModelRef.current?.updateFrame(facePredictions, bodyPredictions);

          avatarModelRef.current?.display(
            { width: canvasWidth, height: canvasHeight },
            context
          );
        }

        context.restore();
      }
    } else if (videoRef.current?.videoHeight === 0) {
      // Display placeholder
      canvasRef.current
        ?.getContext('2d')
        .drawImage(
          placeholderImg,
          0,
          0,
          config.video.videoWidth,
          config.video.videoHeight
        );
    } else {
      // Display original video
      canvasRef.current
        ?.getContext('2d')
        .drawImage(
          videoRef.current,
          0,
          0,
          config.video.videoWidth,
          config.video.videoHeight
        );
    }

    if (canvasWidth && canvasHeight && updateVCam?.current) {
      const frame = canvasRef.current
        ?.getContext('2d')
        ?.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const buffer = Buffer.from(frame.data);
      updateVCam.current(buffer);
    }

    const endTime = performance.now();

    setRealtimeFPS(1000 / (endTime - startTime));
    // schedule to draw the next frame
    requestAnimationFrame(drawFrame);
  };

  useEffect(() => {
    if (videoRef.current) {
      drawFrame();
    }
  }, [videoRef.current]);

  useEffect(() => {
    videoModeRef.current = videoBackgroundMode;
  }, [videoBackgroundMode]);

  useEffect(() => {
    avatarModel?.setFreeMove(!stabilizeEnabled);
  }, [stabilizeEnabled, avatarModel]);

  useEffect(() => {
    scene.current.setVideoBackgroundMode(AREnabled);
  }, [AREnabled, scene]);

  // handle Avatar input
  // const onInput = async (e: any) => {
  //   e.preventDefault();
  //   loading.current = true;
  //   try {
  //     let reader = new FileReader();
  //     if (e.target?.files.length > 0) {
  //       const file = e.target?.files[0];
  //       reader.readAsArrayBuffer(file);
  //       let bytes, buf;
  //       reader.onloadend = async (res) => {
  //         // Handle ZIP file in memory
  //         if (
  //           file.type === 'application/zip' ||
  //           file.type === 'application/x-zip-compressed' ||
  //           file.type === 'application/x-zip'
  //         ) {
  //           var arrayBuffer = reader.result as ArrayBuffer;
  //           bytes = new Uint8Array(arrayBuffer);
  //           buf = Buffer.alloc((res.target?.result as ArrayBuffer)?.byteLength);
  //           for (var i = 0; i < buf.length; ++i) {
  //             buf[i] = bytes[i];
  //           }

  //           // Get encoded live2d data from zip
  //           const live2dData = await getEncodedLive2dJsonFromBuffer(buf);
  //           const encodedModelData = live2dData.model;
  //           encodedModelData.url = ''

  //           // Store expression data
  //           const expData = live2dData.expressions;
  //           if (expData?.size! > 0) {
  //             setExpressions(expData);
  //           }

  //           // Reload model
  //           const model = new Live2dModel(
  //             true,
  //             expData!,
  //             defaultBackgroundURL
  //           );
  //           model.loadFile(encodedModelData);
  //           avatarModelRef.current = model;
  //         } else {
  //           // Handle .glb file in memory
  //           setExpressions(undefined);
  //           const fileExtension = file.name.split('.').pop();
  //           if (fileExtension === 'glb' || fileExtension === 'vrm') {
  //             const objectURL = URL.createObjectURL(file);
  //             let model: AvatarModel | null = null;
  //             if (fileExtension === 'glb') {
  //               // GLTF model
  //               model = new GLTFModel(true, defaultBackgroundURL);
  //             } else if (fileExtension === 'vrm') {
  //               // VRM model
  //               model = new VRMModel(true, defaultBackgroundURL);
  //             }
  //             await model?.loadFile(objectURL);
  //             avatarModelRef.current = model;
  //           } else {
  //             loading.current = false;
  //             throw new Error('File format is not supported.');
  //           }
  //         };
  //         loading.current = false;
  //       };
  //       reader.onerror = async (err) => {
  //         console.error(err);
  //         loading.current = false;
  //         setError('There was an error uploading your model. Send an email to gm@hologram.xyz for further assistance.')
  //       };
  //     };
  //   } catch (e) {
  //     console.error(e);
  //     loading.current = false;
  //     setError('There was an error uploading your model. Send an email to gm@hologram.xyz for further assistance.')
  //   };
  // }

  const handleReset = () => {
    scene.current?.resetItemPlacements();
    scene.current?.resetItemSizes();
    if (
      avatarModelRef?.current.name === 'VRMModel' ||
      avatarModelRef?.current.name === 'GLTFModel'
    ) {
      avatarModelRef?.current.resetCamera();
    } else {
      setZoomFactor(1);
      setPlacement({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
    }
    setRefresh((counter) => counter + 1);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      marginStart="inherit"
      marginEnd="inherit"
    >
      <Box flex={1} pos="relative" overflow="hidden" maxW={canvasWidth}>
        <Fullscreen
          enabled={fullscreenEnabled}
          onChange={(e) => setFullscreenEnabled(e)}
        >
          <video
            ref={pictureInPictureRef}
            id="picture-in-picture"
            style={{ display: 'none' }}
            crossOrigin="anonymous"
            autoPlay
          />
          {!loading.current && (
            <>
              {avatarModel && modelType === 'live2d' && (
                <AvatarDraggable
                  avatarModel={avatarModel}
                  placement={placement}
                  setPlacement={setPlacement}
                  zoomFactor={zoomFactor}
                  setZoomFactor={setZoomFactor}
                  canvasSize={canvasSize}
                  refresh={refresh}
                />
              )}
              <ItemDraggable
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                scene={scene.current}
                refresh={refresh}
              />
            </>
          )}
          <Flex justifyContent="center" w="100%">
            <canvas
              ref={canvasRef}
              width={config.video.videoWidth}
              height={config.video.videoHeight}
              id="output-canvas"
              style={{
                width: fullscreenEnabled ? 'auto' : '100%',
                height: fullscreenEnabled ? '100vh' : '100%',
                aspectRatio: '16/9',
              }}
            />
          </Flex>
        </Fullscreen>
        <Box pos="absolute" top={4} right={4} display={['none', 'initial']}>
          <Tooltip label="Reset">
            <IconButton
              aria-label="face"
              backgroundColor={colors.brand.primary}
              color="black"
              icon={<RxReset fontSize="24px" />}
              variant="solid"
              borderRadius="50%"
              size="md"
              onClick={handleReset}
              zIndex={99}
            />
          </Tooltip>
        </Box>
        {trackingMode === 'face' && !faceTrackingEnabled && (
          <Box
            pos="absolute"
            bottom={4}
            right={4}
            display={['none', 'initial']}
          >
            <Tooltip label="Enable motion capture">
              <IconButton
                aria-label="face"
                backgroundColor={colors.brand.primary}
                color="black"
                icon={<BsFillCameraVideoFill fontSize="18px" />}
                variant="solid"
                borderRadius="50%"
                size="md"
                onClick={() => {
                  loading.current = true;
                  setFaceTrackingEnabled(true);
                  loading.current = false;
                }}
                zIndex={99}
              />
            </Tooltip>
          </Box>
        )}
        {trackingMode === 'face' && faceTrackingEnabled && (
          <Box
            pos="absolute"
            bottom={4}
            right={4}
            display={['none', 'flex']}
            flexDirection="column"
            gap={4}
          >
            {modelType === '3d' && (
              <Tooltip
                label={
                  !handTrackingEnabled
                    ? 'Enable hand capture'
                    : 'Stop hand capture'
                }
              >
                <IconButton
                  aria-label="face"
                  backgroundColor={
                    !handTrackingEnabled ? colors.brand.primary : 'red'
                  }
                  color="black"
                  icon={
                    !handTrackingEnabled ? (
                      <TbHandStop fontSize="18px" />
                    ) : (
                      <TbHandOff fontSize="18px" />
                    )
                  }
                  variant="solid"
                  borderRadius="50%"
                  size="md"
                  onClick={
                    !handTrackingEnabled ? initHandTracking : stopHandTracking
                  }
                  _hover={{
                    bg: !handTrackingEnabled ? colors.brand.primary : 'red',
                  }}
                  zIndex={99}
                />
              </Tooltip>
            )}
            <Tooltip label={!AREnabled ? 'Enable AR mode' : 'Disable AR mode'}>
              <IconButton
                aria-label="face"
                backgroundColor={!AREnabled ? colors.brand.primary : 'red'}
                color="black"
                icon={<Tb3DCubeSphere fontSize="18px" />}
                variant="solid"
                borderRadius="50%"
                size="md"
                onClick={() => setAREnabled(!AREnabled)}
                _hover={{
                  bg: !AREnabled ? colors.brand.primary : 'red',
                }}
                zIndex={99}
              />
            </Tooltip>
            <Tooltip label="Stop motion capture">
              <IconButton
                aria-label="face"
                backgroundColor="red"
                color="black"
                icon={<BsCameraVideoOffFill fontSize="18px" />}
                variant="solid"
                borderRadius="50%"
                size="md"
                onClick={() => setFaceTrackingEnabled(false)}
                zIndex={99}
                _hover={{
                  bg: 'red',
                }}
              />
            </Tooltip>
          </Box>
        )}

        {showFPS && (
          <Box position="absolute" top={4} left={4}>
            <FPSMonitor />
          </Box>
        )}
      </Box>
      <Box
        ml={videoBackgroundMode ? 4 : 0}
        maxW={canvasWidth || 0}
        maxH={canvasHeight || 0}
        flex={videoBackgroundMode ? 1 : 0}
        style={{
          display: videoBackgroundMode ? 'flex' : 'none',
          justifyContent: 'center',
        }}
      >
        <PreviewMedia />
      </Box>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription textColor="black">{error}</AlertDescription>
          <CloseButton
            position="absolute"
            right="0px"
            top="0px"
            color="black"
            onClick={() => setError('')}
          />
        </Alert>
      )}
      {showEditorModal && (
        <TextEditorModal
          isOpen={showEditorModal}
          onClose={() => setShowEditorModal(false)}
        />
      )}
    </Box>
  );
};

export default Preview;
