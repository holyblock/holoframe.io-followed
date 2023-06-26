import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Tensor, InferenceSession } from 'onnxruntime-web';
const ndarray = require('ndarray');
const ops = require('ndarray-ops');
const Papa = require('papaparse');

// global constant
const NUM_FRAMES = 500;
const NUM_CATEGORIES = 6;
const NUM_CLASSES = 11;
const MODEL_PATH = '../../weights/model.onnx'
const DATA_FOLDER = '../../dataset/data/';
const LABEL_NAME = 'labels.csv';
const AVATAR_PATH = './readyplayerme.glb'
const MODEL_BLEND_SHAPES = [
  'EyeBlinkLeft',
  'EyeBlinkRight',
  'JawOpen',
  'MouthSmileLeft',
  'MouthSmileRight',
  'CheekPuff'
]
const MORPH_TARGET_IDX_MAP = Object.entries({
  'EyeBlinkLeft': 5,
  'EyeSquintLeft': 6,
  'EyeWideLeft': 7,
  'EyeBlinkRight': 8,
  'EyeSquintRight': 9,
  'EyeWideRight': 10,
  'JawForward': 11,
  'JawRight': 12,
  'JawLeft': 13,
  'JawOpen': 14,
  'MouthClose': 15,
  'MouthFunnel': 16,
  'MouthPucker': 17,
  'MouthLeft': 18,
  'MouthRight': 19,
  'MouthSmileLeft': 20,
  'MouthSmileRight': 21,
  'MouthFrownLeft': 22,
  'MouthFrownRight': 23,
  'MouthDimpleLeft': 24,
  'MouthDimpleRight': 25,
  'MouthStretchLeft': 26,
  'MouthStretchRight': 27,
  'MouthRollLower': 28,
  'MouthRollUpper': 29,
  'MouthShrugLower': 30,
  'MouthShrugUpper': 31,
  'MouthPressLeft': 32,
  'MouthPressRight': 33,
  'MouthLowerDownLeft': 34,
  'MouthLowerDownRight': 35,
  'MouthUpperUpLeft': 36,
  'MouthUpperUpRight': 37,
  'BrowDownLeft': 38,
  'BrowDownRight': 39,
  'BrowInnerUp': 40,
  'BrowOuterUpLeft': 41,
  'BrowOuterUpRight': 42,
  'CheekPuff': 43,
  'CheekSquintLeft': 44,
  'CheekSquintRight': 45,
  'NoseSneerLeft': 46,
  'NoseSneerRight': 47
});

// monitoring fps for inference
class FpsMonitor {
  constructor() {
    this.reset();
  }

  update() {
    let currTime = new Date();
    if (this.prevTime) {
      let timeDiff = currTime - this.prevTime;
      this.fps = 1000 / timeDiff;
      this.count += 1;
      this.timeDiffSum += timeDiff;
    }
    this.prevTime = currTime;
  }

  printFps() {
    let output = ''
    if (this.fps) {
      let cumulativeFps = 1000 * this.count / this.timeDiffSum;
      output += 'cumulative FPS: ' + cumulativeFps.toFixed(2);
      output += ', FPS: ' + this.fps.toFixed(2);
    }
    output += '\n';
    return output;
  }

  reset() {
    this.prevTime = null;
    this.fps = null;
    this.count = 0;
    this.timeDiffSum = 0;
  }
}

// global variables
var csvData;
var csvLoaded = false;
let onnxSession = null;
let images = [];
let currIdx = 0;
let playing = false;
let playbackTimeout = 0;
let renderer = null;
let scene = null;
let camera = null;
let morphTargets = [];
let pivot = null;
let fpsMonitor = new FpsMonitor();

// html elements
const locSlider = document.getElementById('loc-slider');
const speedSlider = document.getElementById('speed-slider');
const frameCanvas = document.getElementById('frames');
const frameCanvasCtx = frameCanvas.getContext('2d');
const avatarCanvas = document.getElementById('avatar');
const avatarCanvasCtx = avatarCanvas.getContext('2d');
const predictionText = document.getElementById('prediction');
const textPad = document.getElementById('textpad');
const prevBtn = document.getElementById('prev-btn');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');

const loadOnnxModel = async (modelPath) => {
  onnxSession = await InferenceSession.create(modelPath, {
    executionProviders: ['webgl']
  });
};

const loadCSV = (csvPath) => {
  csvLoaded = false;
  fetch(csvPath)
    .then(blob => blob.text())
    .then((text) => {
      csvData = Papa.parse(text, { delimiter: ',', header: true });
      csvLoaded = true;
      textPad.append('CSV loaded\n');
      onLocSliderUpdate(0);
    }).catch(err => console.error(err));
};

const load3dModel = (path) => {
  scene = new THREE.Scene();
  var loader = new GLTFLoader();
  pivot = new THREE.Group();
  camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.1, 1000
  );

  camera.position.set(0, 0.2, 0.9);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x000000);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // this will make the scene much brighter
  renderer.outputEncoding = THREE.sRGBEncoding

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 300, 0);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(75, 300, -75);
  scene.add(dirLight);

  loader.load(path, (gltf) => {
    var faceModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(faceModel);
    const center = box.getCenter(new THREE.Vector3());

    faceModel.position.x += (faceModel.position.x - center.x);
    faceModel.position.y += (faceModel.position.y - center.y);
    faceModel.position.z += (faceModel.position.z - center.z);

    scene.add(faceModel);
    scene.add(pivot);
    pivot.add(faceModel);

    faceModel.traverse((node) => {
      if (node.isMesh && node.morphTargetInfluences) {
        morphTargets.push(node.morphTargetInfluences);
      }
    });

    // make face tilt right
    pivot.rotation.x = 0.8;
  });

  let canvasPixelWidth = avatarCanvas.width / window.devicePixelRatio;
  let canvasPixelHeight = avatarCanvas.height / window.devicePixelRatio;

  // resize rendering
  const needResize = canvasPixelWidth !== window.innerWidth || canvasPixelHeight !== window.innerHeight;
  if (needResize) {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = avatarCanvas.clientWidth / avatarCanvas.clientHeight;
    camera.updateProjectionMatrix();
  }
};

const applyMorphTarget = (morphTargets, idx, val) => {
  for (const morphTarget of morphTargets) {
    morphTarget[idx] = val;
  }
};

const applyAllMorphTargets = (morphTargets, morphTargetIdxMap, prediction) => {
  for (const [k, v] of morphTargetIdxMap) {
    if (k in prediction) {
      applyMorphTarget(morphTargets, v, prediction[k]);
    }
  }
};

const applyHeadTurning = (pivot, prediction) => {
  if ('HeadPitch' in prediction) {
    pivot.rotation.x = -(prediction['HeadPitch'] * 2 - 1) + 0.8;  // 0.8 for correction
  }
  if ('HeadYaw' in prediction) {
    pivot.rotation.y = -(prediction['HeadYaw'] * 2 - 1);
  }
  if ('HeadRoll' in prediction) {
    pivot.rotation.z = -(prediction['HeadRoll'] * 2 - 1);
  }
}

const printPredictionText = (morphTargetIdxMap, prediction) => {
  predictionText.innerText = '';
  predictionText.append(fpsMonitor.printFps());
  for (const [k, v] of morphTargetIdxMap) {
    if (k in prediction) {
      predictionText.append(k + ': ' + prediction[k] + '\n');
    }
  }
  if ('HeadPitch' in prediction) {
    predictionText.append('HeadPitch: ' + prediction['HeadPitch'] + '\n');
  }
  if ('HeadYaw' in prediction) {
    predictionText.append('HeadYaw: ' + prediction['HeadYaw'] + '\n');
  }
  if ('HeadRoll' in prediction) {
    predictionText.append('HeadRoll: ' + prediction['HeadRoll'] + '\n');
  }
};

const loadImages = (imagePaths) => {
  var imgs = [];
  for (const imagePath of imagePaths) {
    var img = new Image();
    img.src = imagePath;
    imgs.push(img);
  }
  return imgs;
};

const imageToTensor = (imgData, width, height) => {
  const dataFromImage = ndarray(new Float32Array(imgData.data), [width, height, 4]);
  const dataProcessed = ndarray(new Float32Array(width * height * 3), [1, 3, height, width]);

  // normalize 0-255 to 0-1
  ops.divseq(dataFromImage, 255.0);

  // Realign imageData from [224*224*4] to the correct dimension [1*3*224*224].
  ops.assign(dataProcessed.pick(0, 0, null, null), dataFromImage.pick(null, null, 2));
  ops.assign(dataProcessed.pick(0, 1, null, null), dataFromImage.pick(null, null, 1));
  ops.assign(dataProcessed.pick(0, 2, null, null), dataFromImage.pick(null, null, 0));

  // generate onnx tensor
  const tensor = new Tensor('float32', dataProcessed.data, [1, 3, width, height]);
  return tensor;
};

const predictionTensorToBlendshapeValue = (tensor, numCategories, numClasses) => {
  const data = tensor[569].data;  // 569 is a hard coded hack
  let prediction = {};
  for (let i = 0; i < numCategories; i++) {
    let maxVal = Number.NEGATIVE_INFINITY;
    let maxIdx = 0;
    for (let j = 0; j < numClasses; j++) {
      let val = data[i * numClasses + j];
      if (val > maxVal) {
        maxVal = val;
        maxIdx = j;
      }
    }
    prediction[MODEL_BLEND_SHAPES[i]] = maxIdx / (numClasses - 1);
  }

  return prediction;
}

const pause = () => {
  playing = false;
  playBtn.innerText = 'play';
  fpsMonitor.reset();
};

const play = () => {
  playing = true;
  playBtn.innerText = 'pause';
  playFrame();
};

const playFrame = async () => {
  if (playing) {
    await plotFrame(currIdx);
    // prepare for next frame
    currIdx = (currIdx + 1) % images.length;
    setTimeout(playFrame, playbackTimeout);
  }
};

const plotFrame = async (idx) => {
  let image = images[idx];
  // video canvas
  frameCanvas.width = image.width;
  frameCanvas.height = image.height;
  avatarCanvas.width = image.width;
  avatarCanvas.height = image.height;
  frameCanvasCtx.drawImage(image, 0, 0, image.width, image.height);
  // transform image into tensor
  const imgData = frameCanvasCtx.getImageData(0, 0, image.width, image.height);
  const tensor = imageToTensor(imgData, image.width, image.height)
  // run a model inference to get prediction
  const outputMap = await onnxSession.run({ 'input.1': tensor });
  const prediction = predictionTensorToBlendshapeValue(
    outputMap, NUM_CATEGORIES, NUM_CLASSES);
  // apply the predicted blend shapes
  applyAllMorphTargets(
    morphTargets, MORPH_TARGET_IDX_MAP, prediction);
  renderer.render(scene, camera);
  avatarCanvasCtx.drawImage(
    renderer.domElement, 0, 0, image.width, image.height);
  // apply head turning effect
  applyHeadTurning(pivot, prediction);
  // update fps monitor
  fpsMonitor.update()
  // prediction text
  printPredictionText(MORPH_TARGET_IDX_MAP, prediction);
};

const prevFrame = () => {
  currIdx -= 1;
  if (currIdx < 0) {
    currIdx = images.length - 1;
  }
  plotFrame(currIdx);
};

const nextFrame = () => {
  currIdx = (currIdx + 1) % images.length;
  plotFrame(currIdx);
};

const onPlayBtnClick = () => {
  if (playing) {
    pause();
  } else {
    play();
  }
};

const onLocSliderUpdate = (value) => {
  const v = value / 100;
  textPad.append('Location update to ' + v + '\n');
  // paue video playing
  pause();
  // load images
  const startLoc = Math.floor(csvData.data.length * v);
  const l = Math.min(NUM_FRAMES, csvData.data.length - startLoc);
  var imagePaths = [];
  for (let i = 0; i < l; i++) {
    if (csvData.data[startLoc + i]['Timecode']) {
      imagePaths.push(
        DATA_FOLDER + csvData.data[startLoc + i]['Timecode'] + '.jpg');
    }
  }
  images = loadImages(imagePaths);
  currIdx = 0;
};

const onSpeedSliderUpdate = (value) => {
  const v = value / 100;
  textPad.append('Speed update to ' + v + '\n');
  playbackTimeout = 50 - v * 50;
  fpsMonitor.reset();
};

const main = async () => {
  // load trained model
  loadOnnxModel(MODEL_PATH);
  // load label csv but for image filenames only
  loadCSV(DATA_FOLDER + LABEL_NAME);
  // slider for video start location
  locSlider.addEventListener('change', (e) => {
    onLocSliderUpdate(e.target.value);
  });
  // slider for video playback rate
  speedSlider.addEventListener('change', (e) => {
    onSpeedSliderUpdate(e.target.value);
  });
  // play / pause
  playBtn.addEventListener('click', () => {
    onPlayBtnClick();
  })
  // previous / next frame
  prevBtn.addEventListener('click', () => {
    prevFrame();
  });
  nextBtn.addEventListener('click', () => {
    nextFrame();
  });
  // load three js model
  load3dModel(AVATAR_PATH);
}

main();
