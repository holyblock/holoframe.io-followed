import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const Papa = require('papaparse');

// global constant
const NUM_FRAMES = 500;
const DATA_FOLDER = '../../dataset/data/';
const LABEL_NAME = 'labels.csv';
const AVATAR_PATH = './readyplayerme.glb'
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

// global variables
var csvData;
var csvLoaded = false;
var images = [];
var currIdx = 0;
var playing = false;
var playbackTimeout = 25;
var renderer = null;
var scene = null;
var camera = null;
var morphTargets = [];
var predictions = [];

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

function loadCSV(csvPath) {
  csvLoaded = false;
  fetch(csvPath)
    .then(blob => blob.text())
    .then((text) => {
      csvData = Papa.parse(text, { delimiter: ',', header: true });
      csvLoaded = true;
      textPad.append('CSV loaded\n');
      onLocSliderUpdate(0);
    }).catch(err => console.error(err));
}

function load3dModel(path) {
  scene = new THREE.Scene();
  var loader = new GLTFLoader();
  var pivot = new THREE.Group();
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
}

function applyMorphTarget(morphTargets, idx, val) {
  for (const morphTarget of morphTargets) {
    morphTarget[idx] = val;
  }
}

function applyAllMorphTargets(morphTargets, morphTargetIdxMap, prediction) {
  for (const [k, v] of morphTargetIdxMap) {
    applyMorphTarget(morphTargets, v, prediction[k]);
  }
}

function printPredictionText(morphTargetIdxMap, prediction) {
  predictionText.innerText = '';
  for (const [k, v] of morphTargetIdxMap) {
    predictionText.append(k + ': ' + prediction[k] + '\n');
  }
}

function loadImages(imagePaths) {
  var imgs = [];
  for (const imagePath of imagePaths) {
    var img = new Image();
    img.src = imagePath;
    imgs.push(img);
  }
  return imgs;
}

function pause() {
  playing = false;
  playBtn.innerText = 'play';
}

function play() {
  playing = true;
  playBtn.innerText = 'pause';
  playFrame();
}

function playFrame() {
  if (playing) {
    plotFrame(currIdx);
    // prepare for next frame
    currIdx = (currIdx + 1) % images.length;
    setTimeout(playFrame, playbackTimeout);
  }
}

function plotFrame(idx) {
  let image = images[idx];
  // video canvas
  frameCanvas.width = image.width;
  frameCanvas.height = image.height;
  avatarCanvas.width = image.width;
  avatarCanvas.height = image.height;
  frameCanvasCtx.drawImage(image, 0, 0, image.width, image.height);
  // avatar canvas
  applyAllMorphTargets(
    morphTargets, MORPH_TARGET_IDX_MAP, predictions[idx]);
  renderer.render(scene, camera);
  avatarCanvasCtx.drawImage(
    renderer.domElement, 0, 0, image.width, image.height);
  // prediction text
  printPredictionText(MORPH_TARGET_IDX_MAP, predictions[idx]);
}

function prevFrame() {
  currIdx -= 1;
  if (currIdx < 0) {
    currIdx = images.length - 1;
  }
  plotFrame(currIdx);
}

function nextFrame() {
  currIdx = (currIdx + 1) % images.length;
  plotFrame(currIdx);
}

function onPlayBtnClick() {
  if (playing) {
    pause();
  } else {
    play();
  }
}

function onLocSliderUpdate(value) {
  const v = value / 100;
  textPad.append('Location update to ' + v + '\n');
  // paue video playing
  pause();
  // load images
  const startLoc = Math.floor(csvData.data.length * v);
  const l = Math.min(NUM_FRAMES, csvData.data.length - startLoc);
  var imagePaths = [];
  predictions = [];
  for (let i = 0; i < l; i++) {
    if (csvData.data[startLoc + i]['Timecode']) {
      imagePaths.push(
        DATA_FOLDER + csvData.data[startLoc + i]['Timecode'] + '.jpg');
      predictions.push(csvData.data[startLoc + i]);
    }
  }
  images = loadImages(imagePaths);
  currIdx = 0;
}

function onSpeedSliderUpdate(value) {
  const v = value / 100;
  textPad.append('Speed update to ' + v + '\n');
  playbackTimeout = 50 - v * 50;
}

async function main() {
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
