import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Alert,
  AlertIcon,
  AlertDescription,
  Box, 
  CloseButton,
  Container, 
  IconButton,
  Heading,
  Flex,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import { BsFillCameraVideoFill } from 'react-icons/bs';
import AlterFaceModel from '../utils/alterFaceModel';
import { AnimationGenerator } from '../utils/animationGenerator';
import { AvatarModel, NFTMetadata } from '../types';
import AvatarGrid from './Views/AvatarGrid';
import { projectDisplayConfig } from '../config/display';
import StudioToolbar from './StudioToolbar';
import AvatarCustomize from './Views/AvatarCustomize';
import BackgroundSelect from './Views/BackgroundSelect';
import StudioPlayground from './Views/StudioPlayground';
import { 
  getEncodedLive2dJsonFromBuffer, 
  handleLive2dZip 
} from '../utils/fileHandler';
import { Live2dModel } from '../utils/live2dModel';
import { GLTFModel } from '../utils/gltfModel';
import { VRMModel } from '../utils/vrmModel';

import constants from '../config/constants';
import { HologramStudioProps } from '..';
import { useStyle } from '../contexts/StyleContext';
import { colors } from '../styles/theme';
import { useSetting } from '../contexts/SettingContext';
import { useAuth } from '../contexts/AuthContext';
import { useNFT } from '../contexts/NFTContext';

const Studio = (props: HologramStudioProps) => {
  const { 
    apiKey, 
    nftMetadataList,
    backgroundList,
    toolbarEnabled, 
    trackingMode,
    uploadEnabled,
    darkmodeEnabled,
    fullscreenEnabled,
    defaultBackgroundURL,
    defaultModelSize,
    animationSequence,
    selectDisplayMode,
    selectedAvatarIndex,
    size,
    disableLoadingScreen,
    disableBannerKey,
    userAddresss
  } = props;
  const { 
    darkEnabled, 
    setDarkEnabled, 
    setSize, 
    setSelectDisplayMode,
    setModelSize,
  } = useStyle();
  const {
    allAvatars,
    avatarIndex,
    selectedScene,
    selectedBgColor,
    expressions,
    selectedExps,
    modelEnabled,
    avatarModel,
    setAllAvatars,
    setAvatarIndex,
    setSelectedScene,
    setSelectedBgColor,
    setExpressions,
    setSelectedExps,
    setModelEnabled,
    setAvatarModel,
  } = useNFT();
  const { setIsAuthenticated, setUserAddress } = useAuth();
  const { selectedDeviceID} = useSetting();
  const [selectedView, setSelectedView] = useState('avatarGrid'); // avatarGrid, customize, background, voice, studio
  // const [allAvatars, setAllAvatars] = useState<any>(
  //   nftMetadataList && nftMetadataList.length > 0 ? nftMetadataList : []
  // );
  // const [avatarIndex, setAvatarIndex] = useState<number>();
  const [faceTrackingEnabled, setFaceTrackingEnabled] = useState(false);
  const [faceModelActive, setFaceModelActive] = useState(false);
  // const [selectedScene, setSelectedScene] = useState<NFTMetadata>();
  // const [selectedBgColor, setSelectedBgColor] = useState<string>('');
  // const [expressions, setExpressions] = useState<Map<string, Array<object>>>();
  // const [selectedExps, setSelectedExps] = useState<string[]>([]);
  // const [modelEnabled, setModelEnabled] = useState(false);
  const [isFullscreenEnabled, setFullscreenEnabled] = useState(fullscreenEnabled === true);
  const [error, setError] = useState('');
  const [loadingImg, setLoadingImg] = useState(new Image());
  loadingImg.crossOrigin = 'anonymous';
  loadingImg.src = darkmodeEnabled 
    ? constants.assets.loadingDark
    : constants.assets.loadingLight;

  const loading = useRef<boolean>(true);
  // const avatarModel = useRef<AvatarModel | null>(null);
  const faceModel = useRef<AlterFaceModel | null>(null);
  const animationGenerator = useRef<AnimationGenerator | null>(null);
  const predictFunc = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pictureInPictureRef = useRef<HTMLVideoElement>(null);

  // Set width and height of our canvas
  let width: number = constants.video.widths.lg;
  switch(size) {
    case 'sm':
      width = constants.video.widths.sm;
      break;
    case 'md':
      width = constants.video.widths.md;
      break;
    case 'lg':
      width = constants.video.widths.lg;
      break;
    case 'xl':
      width = constants.video.widths.xl;
      break;
    default:
      width = constants.video.widths.lg;
  }

  // Set auth
  useEffect(() => {
    setAllAvatars(nftMetadataList && nftMetadataList.length > 0 ? nftMetadataList : []);
    if (userAddresss) {
      setIsAuthenticated(true);
      setUserAddress(userAddresss);
    } else {
      setIsAuthenticated(false);
      setUserAddress('');
    }
  }, [userAddresss]);

  // Set styling
  useEffect(() => {
    setDarkEnabled(darkmodeEnabled);
    setSize(size);
    setSelectDisplayMode(selectDisplayMode ?? 'grid');
    setModelSize(defaultModelSize);
  }, [darkmodeEnabled, size, selectDisplayMode]);

  // Set avatar index
  useEffect(() => {
    if (selectedAvatarIndex >= 0 && selectedAvatarIndex < nftMetadataList.length) {
      setAvatarIndex(selectedAvatarIndex);
    } else {
      setAvatarIndex(0);
    }
  }, [selectedAvatarIndex]);

  // Instantiate picture-in-picture stream capture
  const initPicInPic = () => {
    if (
      pictureInPictureRef.current && 
      !pictureInPictureRef.current.srcObject &&
      videoRef.current?.readyState === 4
    ) {
      const canvasStream = (canvasRef.current as any).captureStream().clone();
      if (canvasStream) {
        pictureInPictureRef.current.srcObject = canvasStream;
      }
    }
  };
  useEffect(() => {
    initPicInPic();
    if (faceTrackingEnabled) {
      initFaceTracking();
    }
  }, [pictureInPictureRef.current, videoRef.current?.readyState]);

  // Handle mouse movement tracking for Avatar
  const updateAvatarLookPosition = useCallback(
    // plain event, not a React synthetic event
    ({ clientX: xPosition, clientY: yPosition }) => {
      if (avatarModel) { 
        const relativeX = xPosition / window.innerWidth;
        const relativeY = yPosition / window.innerHeight;
        avatarModel.current?.lookAt(relativeX, relativeY);
      }
    },
    []
  );
  useEffect(() => {
    const newAvatars = nftMetadataList && nftMetadataList.length > 0 
      ? nftMetadataList 
      : [];
    setAllAvatars(newAvatars);
    // setSelectedAvatar(newAvatars[0]);
  }, [nftMetadataList]);

  // Initialize video feed and any available tracking for Avatar
  useEffect(() => {
    if (!videoRef || !videoRef.current || !loading.current || modelEnabled) return;
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
      if (modelEnabled) {
        setExpressions(undefined);
        await loadModel(allAvatars[avatarIndex]);
      }
    })();
  }, [avatarIndex, modelEnabled]);

  // Handle expression selection
  useEffect(() => {
    avatarModel?.current?.activateExpressions(selectedExps);
  }, [selectedExps.length]);

  // Handle background image selection
  useEffect(() => {
    if (selectedScene) {
      avatarModel?.current?.setBackgroundImage(selectedScene.image);
    }
  }, [selectedScene]);

  // Handle background color selection
  useEffect(() => {
    if (selectedBgColor) {
      avatarModel?.current?.setBackgroundColor(selectedBgColor);
    }
  }, [selectedBgColor]);

  const initFaceTracking = () => {
    loading.current = true;
    const constraints = {
      video: {
        deviceId: selectedDeviceID,
        width: {
          max: constants.video.videoWidth,
          min: constants.video.videoWidth,
        },
        height: {
          max: constants.video.videoHeight,
          min: constants.video.videoHeight,
        },
      },
      audio: false,
    };
    navigator.mediaDevices.getUserMedia(constraints).then(async (stream) => {
      videoRef.current.srcObject = stream;
      await videoRef.current?.play();
    });

    // Start face model
    const model = new AlterFaceModel(apiKey, videoRef.current);
    model.startProcess();
    faceModel.current = model;
    predictFunc.current = model.prediction;

    setFaceTrackingEnabled(true);
    loading.current = false;
  }

  const loadModel = async (modelData: NFTMetadata) => {
    if (!modelData) return;
    loading.current = true;
    if (modelData.type === 'live2d') {
      try {
        // Get encoded live2d data from zip
        const live2dData = await handleLive2dZip(modelData.model_url);
        const encodedModelData = live2dData.model;
        encodedModelData.url = '';

        // Store expression data
        const expData = live2dData.expressions;
        if (expData?.size! > 0) {
          setExpressions(expData);
        }

        // Load model
        const model = new Live2dModel(
          toolbarEnabled || typeof defaultBackgroundURL !== 'undefined', 
          expData,
          defaultBackgroundURL,
          defaultModelSize,
        ); // Show default bg only in studio mode
        await model.loadFile(encodedModelData);
        avatarModel.current = model;

        // Expose live2d model to animation generator, if it exists
        if (animationGenerator.current) {
          animationGenerator.current.registerLive2dModel(model);
        }
      } catch (e) {
        console.error(e);
        loading.current = false;
        setError('There was an issue displaying your model.')
      }
    } else if (
      modelData.type === '3d' && 
      typeof modelData.format !== 'undefined'
    ) {
      let model: AvatarModel | null = null;

      if (modelData.format === 'glb')
        // GLTF model
        model = new GLTFModel(true, defaultBackgroundURL);
      else if (modelData.format=== 'vrm') {
        model = new VRMModel(true, defaultBackgroundURL);
      }
      if (model) {
        await model.loadFile(modelData.model_url);
        avatarModel.current = model; 
      }
    };

    // Load config
    if (modelData.project) {
      const config = (projectDisplayConfig as any)[modelData.project];
      if (config) {
        avatarModel.current?.loadConfig(config);
      }
    };
    loading.current = false;
    canvasRef.current.id = 'output-canvas';
    animationGenerator.current?.resetSequence();
  };

  const displayLoading = () => {
    canvasRef.current.width = constants.video.videoWidth;
    canvasRef.current.height = constants.video.videoHeight;
    canvasRef.current.id = 'loading-canvas';
    const canvasCtx = canvasRef.current?.getContext('2d');
    canvasCtx.drawImage(
      loadingImg, 0, 0, constants.video.videoWidth, constants.video.videoHeight
    );
  }

  const drawFrame = () => {
    if (modelEnabled && avatarModel && canvasRef.current) {
      if (faceModel.current) {
        setFaceModelActive(faceModel?.current?.isModelActive());
      }
      if (loading.current === true && !disableLoadingScreen) {
        // Before face model loaded, display initializing screen
        displayLoading();
      } else {
        // only need to update frame if avatar mode is enabled
        avatarModel.current?.updateFrame(predictFunc.current?.call());

        // Draw avatar
        if (canvasRef.current && avatarModel.current) {
          avatarModel.current?.display(
            canvasRef.current, 
            canvasRef.current?.getContext('2d')!
          );
        }
      }
    } 
    // schedule to draw the next frame
    requestAnimationFrame(drawFrame);
  };

  // handle Avatar input
  const onInput = async (e: any) => {
    e.preventDefault();
    loading.current = true;
    try {
      let reader = new FileReader();
      if (e.target?.files.length > 0) {
        const file = e.target?.files[0];
        reader.readAsArrayBuffer(file);
        let bytes, buf;
        reader.onloadend = async (res) => {
          // Handle ZIP file in memory
          if (
            file.type === 'application/zip' || 
            file.type === 'application/x-zip-compressed' ||
            file.type === 'application/x-zip'
          ) {
            var arrayBuffer = reader.result as ArrayBuffer;
            bytes = new Uint8Array(arrayBuffer);
            buf = Buffer.alloc((res.target?.result as ArrayBuffer)?.byteLength);
            for (var i = 0; i < buf.length; ++i) {
              buf[i] = bytes[i];
            }

            // Get encoded live2d data from zip
            const live2dData = await getEncodedLive2dJsonFromBuffer(buf);
            const encodedModelData = live2dData.model;
            encodedModelData.url = ''

            // Store expression data
            const expData = live2dData.expressions;
            if (expData?.size! > 0) {
              setExpressions(expData);
            }

            // Reload model
            const model = new Live2dModel(
              true, 
              expData!,
              defaultBackgroundURL,
              defaultModelSize,
            );
            model.loadFile(encodedModelData);
            avatarModel.current = model;
          } else {
            // Handle .glb file in memory
            setExpressions(undefined);
            const fileExtension = file.name.split('.').pop();
            if (fileExtension === 'glb' || fileExtension === 'vrm') {
              const objectURL = URL.createObjectURL(file);
              let model: AvatarModel | null = null;
              if (fileExtension === 'glb') {
                // GLTF model
                model = new GLTFModel(true, defaultBackgroundURL);
              } else if (fileExtension === 'vrm') {
                // VRM model
                model = new VRMModel(true, defaultBackgroundURL);
              }
              await model?.loadFile(objectURL);
              avatarModel.current = model;
            } else {
              loading.current = false;
              throw new Error('File format is not supported.');
            }
          };
          loading.current = false;
        };
        reader.onerror = async (err) => {
          console.error(err);
          loading.current = false;
          setError('There was an error uploading your model. Send an email to gm@hologram.xyz for further assistance.')
        };
      };
    } catch (e) {
      console.error(e);
      loading.current = false;
      setError('There was an error uploading your model. Send an email to gm@hologram.xyz for further assistance.')
    };
  };

  const onSelectAvatar = async (index: number) => {
    if (index === avatarIndex) {
      setExpressions(undefined);
      loadModel(allAvatars[index]);
    } else {
      setAvatarIndex(index);
    }
  };

  return (
    <Container
      centerContent 
      display='flex'
      alignItems='center'
      maxW={width}
      height='100%'
    >     
      <Box maxH='100%' pos='relative'>
        <video
          ref={videoRef}
          id='input-video'
          style={{ display: 'none' }}
          autoPlay
          crossOrigin='anonymous'
          onPlay={drawFrame}
          onLoadedData={() => {
            initPicInPic();
          }}
          onSeeked={() => {
            initPicInPic();
          }}
        />
        <video
          ref={pictureInPictureRef}
          id='picture-in-picture'
          style={{ display: 'none' }}
          crossOrigin='anonymous'
          autoPlay
        />
        <Flex
          justifyContent='center'
        >
          <canvas
            ref={canvasRef}
            width={isFullscreenEnabled ? videoRef.current?.videoWidth : width}
            height={isFullscreenEnabled ? videoRef.current?.videoHeight : '100%'}
            id='output-canvas'
            style={{ 
              width: isFullscreenEnabled ? 'auto' : '100%',
              height: isFullscreenEnabled ? '100vh' : '100%', 
              aspectRatio: '16/9',
            }}
          />
        </Flex>
        { trackingMode === 'face' && !faceTrackingEnabled &&
          <Box pos='absolute' bottom={4} right={4} display={['none', 'initial']}>
            <Tooltip label='Try face tracking'>
              <IconButton
                aria-label='face'
                backgroundColor={colors.brand.primary}
                icon={<BsFillCameraVideoFill fontSize='20px' />}
                variant='solid'
                color="black" 
                borderRadius={'50%'}
                size='lg'
                width='50px'
                height='50px'
                onClick={initFaceTracking}
              />
            </Tooltip>
          </Box>
        }
      </Box>
      { toolbarEnabled &&
        <Box w='100%'>
          <StudioToolbar
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            avatarModel={avatarModel.current}
            canvas={canvasRef.current}
            expressions={expressions}
            video={videoRef.current}
            pictureInPicture={pictureInPictureRef.current}
            setFullscreen={setFullscreenEnabled}
          />
          { selectedView === 'avatarGrid' && (
            <AvatarGrid 
              assets={allAvatars} 
              selectedIndex={avatarIndex}
              // onSelect={(avatar: NFTMetadata) => setSelectedAvatar(avatar)}
              onSelect={onSelectAvatar}
              uploadEnabled={uploadEnabled}
              onInput={onInput}
            />
          )}
          { selectedView === 'customize' && (
            <AvatarCustomize
              avatarModel={avatarModel.current}
              expressions={expressions}
              selectedExps={selectedExps}
              setSelectedExps={setSelectedExps}
            />
          )}
          { selectedView === 'background' && (
            <BackgroundSelect
              selectedColor={selectedBgColor ?? ""}
              setColor={setSelectedBgColor}
              scenes={backgroundList}
              selectedScene={selectedScene}
              setScene={setSelectedScene}
            />
          )}
          {/* { selectedView === 'voice' && (
            <div />
          )} */}
          { selectedView === 'studio' && (
            <StudioPlayground
              canvas={canvasRef.current}
              pictureInPicture={
                videoRef.current?.readyState === 4 
                  ? pictureInPictureRef.current
                  : undefined
              }
            />
          )}
        </Box>
      }
      { error && (
        <Alert status='error'>
          <AlertIcon />
          <AlertDescription 
            textColor='black'
          >
            {error}
          </AlertDescription>
          <CloseButton 
            position='absolute' 
            right='0px' 
            top='0px' 
            color='black'
            onClick={() => setError('')}
          />
        </Alert>
      )}
      { disableBannerKey !== 'rollingtech21' &&
        <Link mt={5} href='https://hologram.xyz' isExternal>
          <Heading 
            color={darkEnabled ? 'white' : 'black'} 
            as='a' 
            size='xs' 
          >
            Powered by Hologram
          </Heading>
        </Link>
      }
    </Container>
  );
};

export default Studio;