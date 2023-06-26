import localForage from 'localforage';
import Live2dModel from '../../utils/live2dModel';
import GLTFModel from '../../utils/gltfModel';
import VRMModel from '../../utils/vrmModel';
import AlterFaceModel from '../../utils/alterFaceModel';
import { AudioAnalyser } from '../../utils/audioAnalyser';
import { AvatarModel } from '../../utils/avatarModel';
import { Scene } from '../../utils/scene';
import { unflipCallerVideo, reflipCallerVideo } from '../../utils/faceUtils';
import { handleLive2dZip } from '../../utils/fileHandler';
import expressionKeys from '../../config/expressions';
import { projectConfig } from '../../config/display';
import { getChromeCache } from '../../utils/chromeAPIHelper';

// Initialize DOM elements
const loadingImage = document.createElement('img');
loadingImage.src = chrome.runtime.getURL('./assets/img/loadingpage.png');
const placeholderImage = document.createElement('img');
placeholderImage.src = chrome.runtime.getURL('./assets/img/placeholder.png');
const inVideo = document.createElement('video');
const outCanvas = document.createElement('canvas');
const windowWidth = Math.min(window.innerWidth, 1920);
const windowHeight = Math.round((windowWidth * 9) / 16);
outCanvas.width = windowWidth;
outCanvas.height = windowHeight;
const outCanvasCtx = outCanvas.getContext('2d');
const inAudio = document.createElement('audio');
let unloading: boolean = false; // check if the tab is about to close

// Helper for scription injection to the main page context. Adopted from
// https://stackoverflow.com/questions/9515704/
const injectScript = (filePath: string) => {
  var script = document.createElement('script');
  script.src = filePath;
  script.onload = function () {
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

const injectMediaSwap = () => {
  // 1. Create a new video element (to connect source to webcam)
  inVideo.setAttribute('id', 'input-video');
  inVideo.setAttribute('style', 'display:none');
  inVideo.setAttribute('autoplay', 'true');
  document.documentElement.appendChild(inVideo);

  // 2. Create a canvas element (to update every frame based
  // on new video element and our processing)
  outCanvas.setAttribute('id', 'output-canvas');
  outCanvas.setAttribute('style', 'display:none');
  document.documentElement.appendChild(outCanvas);

  // 3. Create an audio element (to perform lip sync based on audio level)
  inAudio.setAttribute('id', 'input-audio');
  inAudio.setAttribute('style', 'display:none');
  inAudio.setAttribute('autoplay', 'true');
  inAudio.volume = 0; // mute
  document.documentElement.appendChild(inAudio);

  // 4. Overrides getUserMedia to canvas captureStream. Note that
  // we inject the js code since getUserMedia lives in the main page.
  injectScript(chrome.runtime.getURL('tone.js'));
  injectScript(chrome.runtime.getURL('swapMedia.js'));
};

// Perform media swap injection in the beginning
injectMediaSwap();

// Initialized model and video controls
let modelType: string | null = null;
let modelEnabled: boolean = false;
let avatarModel: AvatarModel | null = null;
let alterFaceModel: AlterFaceModel | null = null;
const scene: Scene = new Scene();
const audioAnalyser: AudioAnalyser = new AudioAnalyser();

/**
 * Initialize model class, load metadata, and inject media swapping script
 * @param {*} modelData Fields: { dataURL, id, type, project (optional) }
 * @param {boolean} newModel signifies whether the model is different from previous
 */
const initializeModel = async (modelData: any, newModel?: boolean) => {
  try {
    modelType = modelData.type;
    // Load appropriate project-specific display config
    let config;
    if (modelData.project) {
      config = projectConfig[modelData.project];
    }
    // Based on the data format, activate different avatar model
    switch (modelData.type) {
      case 'live2d':
        if (avatarModel && !newModel && avatarModel.name === 'Live2dModel') {
          avatarModel.modelReady = false;
        } else {
          if (avatarModel && newModel) {
            await chrome.storage.sync.remove('selectedTextures');
          }
          avatarModel = new Live2dModel();
        }

        // Check for texture cache
        let selectedTextures = avatarModel.getActiveTextures();
        if (!selectedTextures) {
          selectedTextures = (await getChromeCache('selectedTextures')) as any;
        }

        // Get transformed Live2D data and load into avatar model
        const live2dData = await handleLive2dZip(
          modelData.dataURL,
          selectedTextures
        );
        const encodedModelData = live2dData.model;
        encodedModelData.url = ''; // Meant to avoid type error from live2dcubism
        await avatarModel.loadFile(encodedModelData);

        // Iitialize texture data if the model is different from previous
        if (newModel && live2dData.textures) {
          await avatarModel.initTextures(live2dData.textures);
          // Notify extension frontend of available textures
          chrome.storage.sync.set({
            textures: live2dData.textures,
          });
        }
        // Notify extension frontend of active textures
        chrome.storage.sync.set({
          selectedTextures: avatarModel.getActiveTextures(),
        });

        // Store expression data
        const expData = live2dData.expressions;
        if (expData?.size! > 0) {
          avatarModel.initExpressions(expData!);
        }
        // Notify extension frontend of available expressions
        const expNames = expData?.size! > 0 ? Array.from(expData?.keys()!) : [];
        chrome.storage.sync.set({
          expressions: expNames,
        });
        chrome.runtime.sendMessage({
          type: 'all_expressions',
          expressions: expNames,
        });

        break;
      case '3d':
        const fileExtension = modelData.dataURL?.split('.').pop();
        if (fileExtension === 'glb' || fileExtension === 'gltf') {
          // GLTF model
          avatarModel = new GLTFModel(config);
          await avatarModel.loadFile(modelData.dataURL);
          break;
        } else if (fileExtension === 'vrm') {
          avatarModel = new VRMModel(config);
          await avatarModel.loadFile(modelData.dataURL);
          break;
        }
    }

    // Load cached placement, size, expressions, and background
    chrome.storage.sync.get(
      [
        'avatarPlacement',
        'avatarSize',
        'selectedExpressions',
        'modelBackground',
        'backgroundType',
        'modelPitch',
        'lipsyncSensitivity',
      ],
      async (res) => {
        if (res.avatarPlacement) {
          avatarModel?.setModelPlacement(
            res.avatarPlacement[0],
            res.avatarPlacement[1]
          );
        }
        if (res.avatarSize) {
          avatarModel?.setSizeFactor(res.avatarSize);
        }
        if (res.selectedExpressions) {
          avatarModel?.activateExpressions(res.selectedExpressions);
        }
        if (res.modelBackground && res.backgroundType) {
          if (res.backgroundType === 'nft') {
            try {
              const backgroundNFTData: string | null =
                await localForage.getItem('backgroundNFTData');
              if (backgroundNFTData) {
                scene.addItem(backgroundNFTData);
              }
            } catch (e) {
              console.log('Cached background not found.');
            }
          } else if (res.backgroundType === 'color') {
            scene.setBackgroundColor(res.modelBackground);
          }
        }
        if (res.modelPitch) {
          setPitch(res.modelPitch);
        }
        if (res.lipsyncSensitivity !== undefined) {
          audioAnalyser.updateSensitivityFactor(res.lipsyncSensitivity);
        }
      }
    );

    // If no background is set, add default
    if (!scene.hasItems()) {
      scene.addItem(chrome.runtime.getURL('./assets/img/background.png'));
    }
  } catch (e) {
    console.error(e);

    // Send error to extension frontend
    chrome.runtime.sendMessage({
      error: 'There was an error while selecting your character', // TODO: better error message
    });
    throw new Error();
  }
};

// -----------------------------------------------
// ---- main logic for video frame processing ----
// -----------------------------------------------

// Initialize and register face model
const initFaceModel = () => {
  alterFaceModel = new AlterFaceModel(inVideo);
  if (
    alterFaceModel &&
    inVideo.readyState == 4 &&
    !alterFaceModel.initialized
  ) {
    // video already ready, but face tracking hasn't been initialized yet, this
    // means the tracking module is loaded after camera feed is (asynchronously)
    // loaded, the "onloadeddata" event listener within the module won't be
    // triggered, so we need to init it here
    alterFaceModel.init();
  }
};

// Initialize frame request id for the draw frame loop
let animationFrameRequestId: any = null;

// Non-blocking function that draws the current video frame + the latest
// processing result to canvas. Note: it is necessary to get the prediction
// in a separate function because any await (even sleep for 1ms) will somehow
// interrupt captureStream and create a blinking effect.
const drawFrame = () => {
  if (modelEnabled) {
    // unflip the video element, the underlying function will apply the
    // flipping effect until success
    unflipCallerVideo();
    if (avatarModel || scene.hasItems()) {
      // check if any of face face tracking or avatar model is still loading
      if (
        !alterFaceModel ||
        !alterFaceModel.isModelActive ||
        (avatarModel && !avatarModel.modelReady)
      ) {
        // before face model loaded, display loading screen
        outCanvasCtx!.drawImage(loadingImage, 0, 0, windowWidth, windowHeight);
      } else {
        scene.display(outCanvas, outCanvasCtx!);

        // only need to update frame if avatar mode is enabled
        if (avatarModel) {
          avatarModel.updateLipSync(audioAnalyser.getVolume());
          avatarModel.updateFrame(alterFaceModel.prediction);
          avatarModel.display(outCanvas, outCanvasCtx!);
        }
      }
    } else {
      // Display placeholder image if no avatar model selected
      outCanvasCtx!.drawImage(
        placeholderImage,
        0,
        0,
        windowWidth,
        windowHeight
      );
    }
  } else {
    // If model not enabled, stop face model and display original video
    if (alterFaceModel && alterFaceModel.timeoutId) {
      alterFaceModel.stopProcess();
    }
    outCanvasCtx!.drawImage(inVideo, 0, 0, windowWidth, windowHeight);
  }
};

// Repeatedly schedule calls to display Avatar using RAF
const executeDrawFrame = () => {
  drawFrame();
  animationFrameRequestId = requestAnimationFrame(executeDrawFrame);
};

// Initialize draw frame loop upon video playing event
const initCameraFeed = () => {
  const initPlay = async () => {
    modelEnabled = (await getChromeCache('modelEnabled')) as boolean;
    // load face model only if the avatar mode is on, otherwise, defer until
    // toggle is on to initialize the face model, this will allow camera feed
    // to load immediately
    if (modelEnabled && alterFaceModel === null) {
      initFaceModel();
    }

    // kick off drawing video frames on canvas
    if (animationFrameRequestId == null) {
      executeDrawFrame();
    }
  };
  inVideo.addEventListener('play', initPlay);
};

// Initialize audio analyser for lip sync
const initAudioAnalyser = () => {
  const initPlay = () => {
    audioAnalyser.connectSource(inAudio);
  };
  inAudio.addEventListener('play', initPlay);
};

/**
 * Set voice pitch modulation from input or cache in chrome storage.
 */
const setPitch = async (inputPitch: number | null = null) => {
  let pitch: any = inputPitch;
  if (pitch === null) {
    pitch = await getChromeCache('modelPitch');
  }
  const newPitchEvent = new CustomEvent('pitch', {
    detail: {
      pitch: pitch,
    },
  });
  window.dispatchEvent(newPitchEvent);
};

/**
 * Initialize model and add chrome API listeners
 */
const init = async () => {
  // run frame drawing loop first, this will be non-blocking, if face model or
  // avatar model not ready, loading page will display; if avatar mode is off,
  // see through video will play first
  initCameraFeed();

  // when the input audio source is playing, connect the analyser to it
  initAudioAnalyser();

  // Attempt to retrieve model cache from chrome storage API
  const cachedModel = await getChromeCache('cachedModel');
  if (cachedModel) {
    await initializeModel(cachedModel);
  }

  // Upon audio media injection initialized, attempt to get / set cached pitch
  window.addEventListener('audioModulated', async () => {
    if (modelEnabled) {
      setPitch(null);
    } else {
      // turn off voice modulation when avatar model is off
      window.dispatchEvent(
        new CustomEvent('pitch', {
          detail: { pitch: 0 },
        })
      );
    }
  });

  // Mark tab being closed, prevent activating background rendering loop
  window.addEventListener('beforeunload', () => {
    unloading = true;
    // If a tab is being closed from the background, we need to disable the
    // manual rendering loop
    if (document.visibilityState === 'hidden') {
      chrome.runtime.sendMessage({
        source: 'content',
        type: 'clear_render',
      });
    }
  });

  // Enable or disable manual render depending on tab visibility
  document.addEventListener('visibilitychange', () => {
    if (!unloading) {
      let eventType: string;
      if (document.visibilityState === 'hidden') {
        eventType = 'initiate_render';
      } else {
        eventType = 'clear_render';
      }
      chrome.runtime.sendMessage({
        source: 'content',
        type: eventType,
      });
    }
  });

  // Keystroke listener to activate/deactivate model special effects
  document.addEventListener('keydown', (e) => {
    if (
      modelType === 'live2d' &&
      e.altKey &&
      expressionKeys[e.keyCode] !== undefined
    ) {
      // Map key code to corresponding expressions
      const expIndex = expressionKeys[e.keyCode];
      if (expIndex === undefined) return;
      const allExps = (avatarModel as any).getExpressionNames() ?? [];
      const targetExp = allExps[expIndex];

      // Get new active expressions
      let activeExps: string[] = (
        avatarModel as any
      ).getActiveExpressionNames();
      if (activeExps.includes(targetExp)) {
        activeExps = activeExps.filter((exp: string) => exp !== targetExp);
      } else {
        activeExps = [...activeExps, targetExp];
      }

      // Activate expressions for Live2D
      avatarModel?.activateExpressions(activeExps);
      chrome.storage.sync.set({ selectedExpressions: activeExps });
    }
  });

  // Send initial msg to bg script to clear pre-existing render cache
  chrome.runtime.sendMessage({
    source: 'content',
    type: 'clear_render',
  });

  // Listeners upon receiving messages from extension frontend
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      // Handle onclick model selection
      if (
        request.type === 'live2d' ||
        request.type === '3d' ||
        request.type === '2d'
      ) {
        const modelData = {
          id: request.id,
          dataURL: request.data,
          type: request.type,
          project: request.project,
        };
        await initializeModel(modelData, true);
        chrome.storage.sync.set({
          cachedModel: modelData,
        });
      } else if (request.type === 'initial_avatar_selection') {
        // Handle initial model autoselection
        const initialModel = request.initialSelectedModel;
        if (initialModel) {
          await initializeModel(initialModel, true);
          chrome.storage.sync.set({
            cachedModel: initialModel,
          });
        }
      } else if (request.type === 'control') {
        // Handle extension toggle on or off
        if (request.state === 'on') {
          modelEnabled = true;
          // if face tracking module hasn't been loaded yet, load it now
          if (!alterFaceModel) {
            initFaceModel();
          }
          alterFaceModel?.startProcess();
          unflipCallerVideo();
          setPitch(null);
          chrome.storage.sync.set({ modelEnabled: true });
        } else {
          modelEnabled = false;
          alterFaceModel?.stopProcess();
          reflipCallerVideo();
          setPitch(0);
          chrome.storage.sync.set({ modelEnabled: false });
        }
        // load cached pitch when avatar is turned on, set pitch to zero when
        // avatar mode is off
        window.dispatchEvent(new CustomEvent('audioModulated'));
      } else if (request.type === 'avatar_placement') {
        const offsets = request.placement;
        avatarModel?.setModelPlacement(offsets[0], offsets[1]);

        if (request.cache) {
          chrome.storage.sync.set({ avatarPlacement: offsets });
        }
      } else if (request.type === 'avatar_size') {
        const sizeFactor = request.size;
        if (sizeFactor <= 2) {
          // TEMP: ensure size factor remains in bound
          avatarModel?.setSizeFactor(sizeFactor);

          if (request.cache) {
            chrome.storage.sync.set({ avatarSize: sizeFactor });
          }
        }
      } else if (request.type === 'expression') {
        const selectedExps = JSON.parse(request.selected);
        avatarModel?.activateExpressions(selectedExps);
        chrome.storage.sync.set({ selectedExpressions: selectedExps });
      } else if (request.type === 'texture') {
        const selectedTextureIndices = JSON.parse(request.selected);
        avatarModel?.activateTextures(selectedTextureIndices);
        chrome.storage.sync.set({ selectedTextures: selectedTextureIndices });

        // Re-initialize model
        const cachedModel = await getChromeCache('cachedModel');
        if (cachedModel) {
          await initializeModel(cachedModel);
        }
      } else if (request.type === 'background_color') {
        const colorHex = request.color;
        scene.setBackgroundColor(colorHex);
        if (request.cache) {
          chrome.storage.sync.set({
            modelBackground: colorHex,
            backgroundType: 'color',
          });
        }
      } else if (request.type === 'background_nft') {
        const imageDataURL = request.dataURL;
        scene.addItem(imageDataURL);
        if (request.source === 'extension') {
          chrome.storage.sync.set({
            backgroundType: 'nft',
            nftID: request.nftID,
            modelBackground: request.imageURL,
          });
          localForage.setItem('backgroundNFTData', imageDataURL);
        }
      } else if (request.type === 'pitch') {
        // Handle pitch change
        if (request.cache) {
          chrome.storage.sync.set({ modelPitch: request.pitchLevel });
        }
        setPitch(request.pitchLevel);
      } else if (request.type === 'lipsync_sensitivity') {
        // Handle update in lipsync sensitivity factor
        if (request.value !== undefined) {
          audioAnalyser.updateSensitivityFactor(request.value);
          chrome.storage.sync.set({ lipsyncSensitivity: request.value });
        }
      } else if (request.type === 'manual_render') {
        // Handle manual render during inactive tab
        if (modelEnabled) {
          avatarModel?.manualRender();
          alterFaceModel?.predict(inVideo);
        }
        drawFrame();
      } else if (request.type === 'stabilize') {
        if (request.value !== undefined) {
          avatarModel?.setFreeMove(!request.value);
          chrome.storage.sync.set({ stabilize: request.value });
        }
      }
      // mark listern successfully receiving message
      sendResponse({ ack: true });
    }
  );
};

init();
