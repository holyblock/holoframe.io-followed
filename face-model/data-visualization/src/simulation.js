import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Tensor, InferenceSession } from 'onnxruntime-web';

const ndarray = require('ndarray');
const ops = require('ndarray-ops');

// global constant
const NUM_CATEGORIES = 53;
const NUM_CLASSES = 11;
const BF_SIZE = 128;
const BF_THRESHOLD = 1.0986;  // reverse_sigmoid(0.75)
const IMAGE_SIZE = 224;
const BLAZE_FACE_PATH = '../../blaze-face/blazeface.onnx'
const MODEL_PATH = '../../weights/model.onnx'
const AVATAR_PATH = './readyplayerme.glb'
const MODEL_BLEND_SHAPES = [
    'EyeBlinkLeft',
    'EyeBlinkRight',
    'EyeWideLeft',
    'EyeWideRight',
    'JawOpen',
    'MouthSmileLeft',
    'MouthSmileRight',
    "EyeSquintLeft",
    "EyeSquintRight",
    "MouthFunnel",
    "MouthPucker",
    "MouthFrownLeft",
    "MouthFrownRight",
    "MouthShrugUpper",
    "MouthShrugLower",
    "BrowDownLeft",
    "BrowDownRight",
    "BrowInnerUp",
    "BrowOuterUpLeft",
    "BrowOuterUpRight",
    "NoseSneerLeft",
    "NoseSneerRight",
    'HeadYaw',
    'HeadPitch',
    'HeadRoll',
    "CheekPuff",
    "MouthLowerDownLeft",
    "MouthLowerDownRight",
    "MouthUpperUpLeft",
    "MouthUpperUpRight",
    "MouthLeft",
    "MouthRight",
    "JawLeft",
    "JawRight",
    "MouthClose",
    "MouthDimpleLeft",
    "MouthDimpleRight",
    "MouthStretchLeft",
    "MouthStretchRight",
    "MouthRollLower",
    "MouthRollUpper",
    "MouthPressLeft",
    "MouthPressRight",
    "CheekSquintLeft",
    "CheekSquintRight",
    "EyeLookInLeft",
    "EyeLookInRight",
    "EyeLookOutLeft",
    "EyeLookOutRight",
    "EyeLookUpLeft",
    "EyeLookUpRight",
    "EyeLookDownLeft",
    "EyeLookDownRight"
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

const ANCHORS = [
    [0.03125, 0.03125, 0.09375, 0.09375, 0.15625, 0.15625, 0.21875,
        0.21875, 0.28125, 0.28125, 0.34375, 0.34375, 0.40625, 0.40625,
        0.46875, 0.46875, 0.53125, 0.53125, 0.59375, 0.59375, 0.65625,
        0.65625, 0.71875, 0.71875, 0.78125, 0.78125, 0.84375, 0.84375,
        0.90625, 0.90625, 0.96875, 0.96875, 0.03125, 0.03125, 0.09375,
        0.09375, 0.15625, 0.15625, 0.21875, 0.21875, 0.28125, 0.28125,
        0.34375, 0.34375, 0.40625, 0.40625, 0.46875, 0.46875, 0.53125,
        0.53125, 0.59375, 0.59375, 0.65625, 0.65625, 0.71875, 0.71875,
        0.78125, 0.78125, 0.84375, 0.84375, 0.90625, 0.90625, 0.96875,
        0.96875, 0.03125, 0.03125, 0.09375, 0.09375, 0.15625, 0.15625,
        0.21875, 0.21875, 0.28125, 0.28125, 0.34375, 0.34375, 0.40625,
        0.40625, 0.46875, 0.46875, 0.53125, 0.53125, 0.59375, 0.59375,
        0.65625, 0.65625, 0.71875, 0.71875, 0.78125, 0.78125, 0.84375,
        0.84375, 0.90625, 0.90625, 0.96875, 0.96875, 0.03125, 0.03125,
        0.09375, 0.09375, 0.15625, 0.15625, 0.21875, 0.21875, 0.28125,
        0.28125, 0.34375, 0.34375, 0.40625, 0.40625, 0.46875, 0.46875,
        0.53125, 0.53125, 0.59375, 0.59375, 0.65625, 0.65625, 0.71875,
        0.71875, 0.78125, 0.78125, 0.84375, 0.84375, 0.90625, 0.90625,
        0.96875, 0.96875, 0.03125, 0.03125, 0.09375, 0.09375, 0.15625,
        0.15625, 0.21875, 0.21875, 0.28125, 0.28125, 0.34375, 0.34375,
        0.40625, 0.40625, 0.46875, 0.46875, 0.53125, 0.53125, 0.59375,
        0.59375, 0.65625, 0.65625, 0.71875, 0.71875, 0.78125, 0.78125,
        0.84375, 0.84375, 0.90625, 0.90625, 0.96875, 0.96875, 0.03125,
        0.03125, 0.09375, 0.09375, 0.15625, 0.15625, 0.21875, 0.21875,
        0.28125, 0.28125, 0.34375, 0.34375, 0.40625, 0.40625, 0.46875,
        0.46875, 0.53125, 0.53125, 0.59375, 0.59375, 0.65625, 0.65625,
        0.71875, 0.71875, 0.78125, 0.78125, 0.84375, 0.84375, 0.90625,
        0.90625, 0.96875, 0.96875, 0.03125, 0.03125, 0.09375, 0.09375,
        0.15625, 0.15625, 0.21875, 0.21875, 0.28125, 0.28125, 0.34375,
        0.34375, 0.40625, 0.40625, 0.46875, 0.46875, 0.53125, 0.53125,
        0.59375, 0.59375, 0.65625, 0.65625, 0.71875, 0.71875, 0.78125,
        0.78125, 0.84375, 0.84375, 0.90625, 0.90625, 0.96875, 0.96875,
        0.03125, 0.03125, 0.09375, 0.09375, 0.15625, 0.15625, 0.21875,
        0.21875, 0.28125, 0.28125, 0.34375, 0.34375, 0.40625, 0.40625,
        0.46875, 0.46875, 0.53125, 0.53125, 0.59375, 0.59375, 0.65625,
        0.65625, 0.71875, 0.71875, 0.78125, 0.78125, 0.84375, 0.84375,
        0.90625, 0.90625, 0.96875, 0.96875, 0.03125, 0.03125, 0.09375,
        0.09375, 0.15625, 0.15625, 0.21875, 0.21875, 0.28125, 0.28125,
        0.34375, 0.34375, 0.40625, 0.40625, 0.46875, 0.46875, 0.53125,
        0.53125, 0.59375, 0.59375, 0.65625, 0.65625, 0.71875, 0.71875,
        0.78125, 0.78125, 0.84375, 0.84375, 0.90625, 0.90625, 0.96875,
        0.96875, 0.03125, 0.03125, 0.09375, 0.09375, 0.15625, 0.15625,
        0.21875, 0.21875, 0.28125, 0.28125, 0.34375, 0.34375, 0.40625,
        0.40625, 0.46875, 0.46875, 0.53125, 0.53125, 0.59375, 0.59375,
        0.65625, 0.65625, 0.71875, 0.71875, 0.78125, 0.78125, 0.84375,
        0.84375, 0.90625, 0.90625, 0.96875, 0.96875, 0.03125, 0.03125,
        0.09375, 0.09375, 0.15625, 0.15625, 0.21875, 0.21875, 0.28125,
        0.28125, 0.34375, 0.34375, 0.40625, 0.40625, 0.46875, 0.46875,
        0.53125, 0.53125, 0.59375, 0.59375, 0.65625, 0.65625, 0.71875,
        0.71875, 0.78125, 0.78125, 0.84375, 0.84375, 0.90625, 0.90625,
        0.96875, 0.96875, 0.03125, 0.03125, 0.09375, 0.09375, 0.15625,
        0.15625, 0.21875, 0.21875, 0.28125, 0.28125, 0.34375, 0.34375,
        0.40625, 0.40625, 0.46875, 0.46875, 0.53125, 0.53125, 0.59375,
        0.59375, 0.65625, 0.65625, 0.71875, 0.71875, 0.78125, 0.78125,
        0.84375, 0.84375, 0.90625, 0.90625, 0.96875, 0.96875, 0.03125,
        0.03125, 0.09375, 0.09375, 0.15625, 0.15625, 0.21875, 0.21875,
        0.28125, 0.28125, 0.34375, 0.34375, 0.40625, 0.40625, 0.46875,
        0.46875, 0.53125, 0.53125, 0.59375, 0.59375, 0.65625, 0.65625,
        0.71875, 0.71875, 0.78125, 0.78125, 0.84375, 0.84375, 0.90625,
        0.90625, 0.96875, 0.96875, 0.03125, 0.03125, 0.09375, 0.09375,
        0.15625, 0.15625, 0.21875, 0.21875, 0.28125, 0.28125, 0.34375,
        0.34375, 0.40625, 0.40625, 0.46875, 0.46875, 0.53125, 0.53125,
        0.59375, 0.59375, 0.65625, 0.65625, 0.71875, 0.71875, 0.78125,
        0.78125, 0.84375, 0.84375, 0.90625, 0.90625, 0.96875, 0.96875,
        0.03125, 0.03125, 0.09375, 0.09375, 0.15625, 0.15625, 0.21875,
        0.21875, 0.28125, 0.28125, 0.34375, 0.34375, 0.40625, 0.40625,
        0.46875, 0.46875, 0.53125, 0.53125, 0.59375, 0.59375, 0.65625,
        0.65625, 0.71875, 0.71875, 0.78125, 0.78125, 0.84375, 0.84375,
        0.90625, 0.90625, 0.96875, 0.96875, 0.03125, 0.03125, 0.09375,
        0.09375, 0.15625, 0.15625, 0.21875, 0.21875, 0.28125, 0.28125,
        0.34375, 0.34375, 0.40625, 0.40625, 0.46875, 0.46875, 0.53125,
        0.53125, 0.59375, 0.59375, 0.65625, 0.65625, 0.71875, 0.71875,
        0.78125, 0.78125, 0.84375, 0.84375, 0.90625, 0.90625, 0.96875,
        0.96875, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375,
        0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.1875,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.3125, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.4375, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.5625, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.0625,
        0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.1875, 0.1875,
        0.1875, 0.1875, 0.1875, 0.1875, 0.3125, 0.3125, 0.3125,
        0.3125, 0.3125, 0.3125, 0.4375, 0.4375, 0.4375, 0.4375,
        0.4375, 0.4375, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625,
        0.5625, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875,
        0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.9375,
        0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.0625, 0.0625,
        0.0625, 0.0625, 0.0625, 0.0625, 0.1875, 0.1875, 0.1875,
        0.1875, 0.1875, 0.1875, 0.3125, 0.3125, 0.3125, 0.3125,
        0.3125, 0.3125, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375,
        0.4375, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625,
        0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.8125,
        0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.9375, 0.9375,
        0.9375, 0.9375, 0.9375, 0.9375, 0.0625, 0.0625, 0.0625,
        0.0625, 0.0625, 0.0625, 0.1875, 0.1875, 0.1875, 0.1875,
        0.1875, 0.1875, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125,
        0.3125, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375,
        0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.6875,
        0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.8125, 0.8125,
        0.8125, 0.8125, 0.8125, 0.8125, 0.9375, 0.9375, 0.9375,
        0.9375, 0.9375, 0.9375, 0.0625, 0.0625, 0.0625, 0.0625,
        0.0625, 0.0625, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875,
        0.1875, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125,
        0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.5625,
        0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.6875, 0.6875,
        0.6875, 0.6875, 0.6875, 0.6875, 0.8125, 0.8125, 0.8125,
        0.8125, 0.8125, 0.8125, 0.9375, 0.9375, 0.9375, 0.9375,
        0.9375, 0.9375, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.0625, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.5625, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.6875, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.8125, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375,
        0.9375, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375],
    [0.03125, 0.03125, 0.03125, 0.03125, 0.03125, 0.03125, 0.03125,
        0.03125, 0.03125, 0.03125, 0.03125, 0.03125, 0.03125, 0.03125,
        0.03125, 0.03125, 0.03125, 0.03125, 0.03125, 0.03125, 0.03125,
        0.03125, 0.03125, 0.03125, 0.03125, 0.03125, 0.03125, 0.03125,
        0.03125, 0.03125, 0.03125, 0.03125, 0.09375, 0.09375, 0.09375,
        0.09375, 0.09375, 0.09375, 0.09375, 0.09375, 0.09375, 0.09375,
        0.09375, 0.09375, 0.09375, 0.09375, 0.09375, 0.09375, 0.09375,
        0.09375, 0.09375, 0.09375, 0.09375, 0.09375, 0.09375, 0.09375,
        0.09375, 0.09375, 0.09375, 0.09375, 0.09375, 0.09375, 0.09375,
        0.09375, 0.15625, 0.15625, 0.15625, 0.15625, 0.15625, 0.15625,
        0.15625, 0.15625, 0.15625, 0.15625, 0.15625, 0.15625, 0.15625,
        0.15625, 0.15625, 0.15625, 0.15625, 0.15625, 0.15625, 0.15625,
        0.15625, 0.15625, 0.15625, 0.15625, 0.15625, 0.15625, 0.15625,
        0.15625, 0.15625, 0.15625, 0.15625, 0.15625, 0.21875, 0.21875,
        0.21875, 0.21875, 0.21875, 0.21875, 0.21875, 0.21875, 0.21875,
        0.21875, 0.21875, 0.21875, 0.21875, 0.21875, 0.21875, 0.21875,
        0.21875, 0.21875, 0.21875, 0.21875, 0.21875, 0.21875, 0.21875,
        0.21875, 0.21875, 0.21875, 0.21875, 0.21875, 0.21875, 0.21875,
        0.21875, 0.21875, 0.28125, 0.28125, 0.28125, 0.28125, 0.28125,
        0.28125, 0.28125, 0.28125, 0.28125, 0.28125, 0.28125, 0.28125,
        0.28125, 0.28125, 0.28125, 0.28125, 0.28125, 0.28125, 0.28125,
        0.28125, 0.28125, 0.28125, 0.28125, 0.28125, 0.28125, 0.28125,
        0.28125, 0.28125, 0.28125, 0.28125, 0.28125, 0.28125, 0.34375,
        0.34375, 0.34375, 0.34375, 0.34375, 0.34375, 0.34375, 0.34375,
        0.34375, 0.34375, 0.34375, 0.34375, 0.34375, 0.34375, 0.34375,
        0.34375, 0.34375, 0.34375, 0.34375, 0.34375, 0.34375, 0.34375,
        0.34375, 0.34375, 0.34375, 0.34375, 0.34375, 0.34375, 0.34375,
        0.34375, 0.34375, 0.34375, 0.40625, 0.40625, 0.40625, 0.40625,
        0.40625, 0.40625, 0.40625, 0.40625, 0.40625, 0.40625, 0.40625,
        0.40625, 0.40625, 0.40625, 0.40625, 0.40625, 0.40625, 0.40625,
        0.40625, 0.40625, 0.40625, 0.40625, 0.40625, 0.40625, 0.40625,
        0.40625, 0.40625, 0.40625, 0.40625, 0.40625, 0.40625, 0.40625,
        0.46875, 0.46875, 0.46875, 0.46875, 0.46875, 0.46875, 0.46875,
        0.46875, 0.46875, 0.46875, 0.46875, 0.46875, 0.46875, 0.46875,
        0.46875, 0.46875, 0.46875, 0.46875, 0.46875, 0.46875, 0.46875,
        0.46875, 0.46875, 0.46875, 0.46875, 0.46875, 0.46875, 0.46875,
        0.46875, 0.46875, 0.46875, 0.46875, 0.53125, 0.53125, 0.53125,
        0.53125, 0.53125, 0.53125, 0.53125, 0.53125, 0.53125, 0.53125,
        0.53125, 0.53125, 0.53125, 0.53125, 0.53125, 0.53125, 0.53125,
        0.53125, 0.53125, 0.53125, 0.53125, 0.53125, 0.53125, 0.53125,
        0.53125, 0.53125, 0.53125, 0.53125, 0.53125, 0.53125, 0.53125,
        0.53125, 0.59375, 0.59375, 0.59375, 0.59375, 0.59375, 0.59375,
        0.59375, 0.59375, 0.59375, 0.59375, 0.59375, 0.59375, 0.59375,
        0.59375, 0.59375, 0.59375, 0.59375, 0.59375, 0.59375, 0.59375,
        0.59375, 0.59375, 0.59375, 0.59375, 0.59375, 0.59375, 0.59375,
        0.59375, 0.59375, 0.59375, 0.59375, 0.59375, 0.65625, 0.65625,
        0.65625, 0.65625, 0.65625, 0.65625, 0.65625, 0.65625, 0.65625,
        0.65625, 0.65625, 0.65625, 0.65625, 0.65625, 0.65625, 0.65625,
        0.65625, 0.65625, 0.65625, 0.65625, 0.65625, 0.65625, 0.65625,
        0.65625, 0.65625, 0.65625, 0.65625, 0.65625, 0.65625, 0.65625,
        0.65625, 0.65625, 0.71875, 0.71875, 0.71875, 0.71875, 0.71875,
        0.71875, 0.71875, 0.71875, 0.71875, 0.71875, 0.71875, 0.71875,
        0.71875, 0.71875, 0.71875, 0.71875, 0.71875, 0.71875, 0.71875,
        0.71875, 0.71875, 0.71875, 0.71875, 0.71875, 0.71875, 0.71875,
        0.71875, 0.71875, 0.71875, 0.71875, 0.71875, 0.71875, 0.78125,
        0.78125, 0.78125, 0.78125, 0.78125, 0.78125, 0.78125, 0.78125,
        0.78125, 0.78125, 0.78125, 0.78125, 0.78125, 0.78125, 0.78125,
        0.78125, 0.78125, 0.78125, 0.78125, 0.78125, 0.78125, 0.78125,
        0.78125, 0.78125, 0.78125, 0.78125, 0.78125, 0.78125, 0.78125,
        0.78125, 0.78125, 0.78125, 0.84375, 0.84375, 0.84375, 0.84375,
        0.84375, 0.84375, 0.84375, 0.84375, 0.84375, 0.84375, 0.84375,
        0.84375, 0.84375, 0.84375, 0.84375, 0.84375, 0.84375, 0.84375,
        0.84375, 0.84375, 0.84375, 0.84375, 0.84375, 0.84375, 0.84375,
        0.84375, 0.84375, 0.84375, 0.84375, 0.84375, 0.84375, 0.84375,
        0.90625, 0.90625, 0.90625, 0.90625, 0.90625, 0.90625, 0.90625,
        0.90625, 0.90625, 0.90625, 0.90625, 0.90625, 0.90625, 0.90625,
        0.90625, 0.90625, 0.90625, 0.90625, 0.90625, 0.90625, 0.90625,
        0.90625, 0.90625, 0.90625, 0.90625, 0.90625, 0.90625, 0.90625,
        0.90625, 0.90625, 0.90625, 0.90625, 0.96875, 0.96875, 0.96875,
        0.96875, 0.96875, 0.96875, 0.96875, 0.96875, 0.96875, 0.96875,
        0.96875, 0.96875, 0.96875, 0.96875, 0.96875, 0.96875, 0.96875,
        0.96875, 0.96875, 0.96875, 0.96875, 0.96875, 0.96875, 0.96875,
        0.96875, 0.96875, 0.96875, 0.96875, 0.96875, 0.96875, 0.96875,
        0.96875, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625, 0.0625,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875,
        0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.1875, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.3125,
        0.3125, 0.3125, 0.3125, 0.3125, 0.3125, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375, 0.4375,
        0.4375, 0.4375, 0.4375, 0.4375, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625, 0.5625,
        0.5625, 0.5625, 0.5625, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875, 0.6875,
        0.6875, 0.6875, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125, 0.8125,
        0.8125, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375,
        0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375,
        0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375,
        0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375,
        0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375,
        0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375,
        0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375, 0.9375]
];

// global variables
let renderer = null;
let scene = null;
let camera = null;
let morphTargets = [];
let pivot = null;
let blazeFaceDetector = null;
let facialExpressionModel = null;
let fpsMonitor = null;

// html elementsr');
const frameCanvas = document.getElementById('frames');
const frameCanvasCtx = frameCanvas.getContext('2d');
const modelInputCanvas = document.getElementById('model-input');
const modelInputCanvasCtx = modelInputCanvas.getContext('2d');
const avatarCanvas = document.getElementById('avatar');
const avatarCanvasCtx = avatarCanvas.getContext('2d');
const predictionText = document.getElementById('prediction');

let HAS_FACE_FLAG = false

// discipline canvas size
modelInputCanvas.width = IMAGE_SIZE;
modelInputCanvas.height = IMAGE_SIZE;
avatarCanvas.width = IMAGE_SIZE;
avatarCanvas.height = IMAGE_SIZE;

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

// image resizing
class ImageResizer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.fillStyle = 'black';
        this.canvasCtx.fillRect(0, 0, width, height);
        // document.body.appendChild(this.canvas);
    }

    resize(image) {
        let ratio = image.width / image.height;
        let width = Math.floor(Math.min(this.canvas.width, this.canvas.height * ratio));
        let height = Math.floor(Math.min(this.canvas.height, this.canvas.width / ratio));
        let widthStart = Math.floor((this.canvas.width - width) / 2);
        let heightStart = Math.floor((this.canvas.height - height) / 2);
        this.canvasCtx.drawImage(image, widthStart, heightStart, width, height);
        return this.canvasCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
}

// face bounding box detection
class FaceDetector {
    constructor() {
        this.imageResizer = new ImageResizer(BF_SIZE, BF_SIZE);
    }

    async init() {
        this.blazeFaceSession = await loadOnnxModel(BLAZE_FACE_PATH);
    }

    decodeBox(box, mask) {
        let idx = [];
        for (let i = 0; i < 896; i++) {
            if (mask[i] > BF_THRESHOLD) {
                // x center
                box[i * 16] = box[i * 16] / BF_SIZE + ANCHORS[0][i];
                // y center
                box[i * 16 + 1] = box[i * 16 + 1] / BF_SIZE + ANCHORS[1][i];
                // width
                box[i * 16 + 2] /= BF_SIZE;
                // height
                box[i * 16 + 3] /= BF_SIZE;
                idx.push(i);
            }
        }
        return idx;
    }

    async detect(frameCanvas, outCanvasCtx, outCanvasSize) {
        if (HAS_FACE_FLAG) {
            return
        }
        const resizedImg = this.imageResizer.resize(frameCanvas);
        const tensor = imageToTensor(
            resizedImg, this.imageResizer.width, this.imageResizer.height, -1, 1);
        // run a model inference to get prediction
        const outputMap = await this.blazeFaceSession.run({ 'x.1': tensor });
        let box = outputMap[197].data;
        let mask = outputMap[178].data;
        // process outputMap to get bounding box
        const faceIdx = this.decodeBox(box, mask);
        if (faceIdx.length > 0) {
            let i = faceIdx[0];
            // convert to face coordinate
            let x = Math.floor(box[i * 16] * frameCanvas.width);
            let y = Math.floor(box[i * 16 + 1] * frameCanvas.height);
            let w = Math.floor(box[i * 16 + 2] * frameCanvas.width * 1.2);
            let h = Math.floor(box[i * 16 + 3] * frameCanvas.height * 1.2);
            if (this.prev_box) {
                x = this.prev_box['x'] * 0.95 + 0.05 * x
                y = this.prev_box['y'] * 0.95 + 0.05 * y
                w = this.prev_box['w'] * 0.95 + 0.05 * w
                h = this.prev_box['h'] * 0.95 + 0.05 * h
            }
            this.prev_box = { 'x': x, 'y': y, 'w': w, 'h': h }

            let s = Math.min(w, h, x, y, frameCanvas.width - x, frameCanvas.height - y);
            // draw image within bounding box on output canvas
            outCanvasCtx.drawImage(
                frameCanvas,
                x - s, y - s, s * 2, s * 2,
                0, 0, outCanvasSize, outCanvasSize);
            HAS_FACE_FLAG = true;
        }
    }
}

// facial expression model
class FacialExpressionModel {
    constructor() {
        this.size = IMAGE_SIZE;
    }

    async init() {
        this.facialModelSession = await loadOnnxModel(MODEL_PATH);
    }

    async process(modelInputCanvasCtx) {
        const imgData = modelInputCanvasCtx.getImageData(0, 0, this.size, this.size);
        const tensor = imageToTensor(imgData, this.size, this.size);
        // run a model inference to get prediction
        const outputMap = await this.facialModelSession.run({ 'input.1': tensor });
        const prediction = predictionTensorToBlendshapeValue(
            outputMap, NUM_CATEGORIES, NUM_CLASSES, this.prediction);
        this.prediction = prediction
        return prediction;
    }
}

const loadOnnxModel = async (modelPath) => {
    let onnxSession = await InferenceSession.create(modelPath, {
        executionProviders: ['webgl']
    });
    return onnxSession;
};

const loadCameraFeed = () => {
    let video = document.createElement('video');
    video.setAttribute('autoplay', 'true');
    navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(
        function success(stream) {
            video.srcObject = stream;
        }
    );
    const drawFrame = () => {
        frameCanvas.width = video.videoWidth;
        frameCanvas.height = video.videoHeight;
        frameCanvasCtx.drawImage(
            video, 0, 0, frameCanvas.width, frameCanvas.height);
        // setTimeout(() => drawFrame(), 0);
        requestAnimationFrame(drawFrame);
    }
    video.addEventListener('play', drawFrame());
};

const load3dModel = (path) => {
    scene = new THREE.Scene();
    let loader = new GLTFLoader();
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
        let faceModel = gltf.scene;
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

const runInference = async () => {
    if (frameCanvas.width != 0 && frameCanvas.height != 0) {
        // find face bounding box
        blazeFaceDetector.detect(frameCanvas, modelInputCanvasCtx, IMAGE_SIZE);
        // get blend shape prediction
        const prediction = await facialExpressionModel.process(modelInputCanvasCtx);
        // apply the predicted blend shapes
        applyAllMorphTargets(
            morphTargets, MORPH_TARGET_IDX_MAP, prediction);
        // apply head turning effect
        applyHeadTurning(pivot, prediction);
        renderer.render(scene, camera);
        avatarCanvasCtx.clearRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);
        avatarCanvasCtx.drawImage(
            renderer.domElement, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

        // update fps monitor
        fpsMonitor.update();
        // prediction text
        printPredictionText(MORPH_TARGET_IDX_MAP, prediction);
        HAS_FACE_FLAG = false;
    }
    requestAnimationFrame(runInference);
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
        // pivot.rotation.x = -0.5 * (prediction['HeadPitch'] * 2 - 1) + 0.8;  // 0.8 for correction
        pivot.rotation.x = prediction['HeadPitch'] + 0.8;  // 0.8 for correction
    }
    if ('HeadYaw' in prediction) {
        // pivot.rotation.y = -0.5 * (prediction['HeadYaw'] * 2 - 1);
        pivot.rotation.y = -prediction['HeadYaw'];

    }
    if ('HeadRoll' in prediction) {
        // pivot.rotation.z = -0.5 * (prediction['HeadRoll'] * 2 - 1);
        pivot.rotation.z = prediction['HeadRoll'] / 3.14;
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

const imageToTensor = (imgData, width, height, low = 0, high = 1) => {
    const dataFromImage = ndarray(new Float32Array(imgData.data), [width, height, 4]);
    const dataProcessed = ndarray(new Float32Array(width * height * 3), [1, 3, height, width]);

    // normalize [0, 255] to [0, 1] or [-1, 1]
    ops.divseq(dataFromImage, 255.0 / (high - low));
    ops.addseq(dataFromImage, low);

    // Realign imageData from [224*224*4] to the correct dimension [1*3*224*224].
    ops.assign(dataProcessed.pick(0, 0, null, null), dataFromImage.pick(null, null, 2));
    ops.assign(dataProcessed.pick(0, 1, null, null), dataFromImage.pick(null, null, 1));
    ops.assign(dataProcessed.pick(0, 2, null, null), dataFromImage.pick(null, null, 0));

    // generate onnx tensor
    const tensor = new Tensor('float32', dataProcessed.data, [1, 3, width, height]);
    return tensor;
};

const predictionTensorToBlendshapeValue = (tensor, numCategories, numClasses, prev_pred) => {
    const data = tensor[566].data;  // 569 is a hard coded hack
    let prediction = {};
    for (let i = 0; i < numCategories; i++) {
        prediction[MODEL_BLEND_SHAPES[i]] = data[i]
    }

    // apply moving average
    if (prev_pred) {
        for (name in prediction) {
            if (name.includes('Head')) {
                if (name == 'HeadPitch') {
                    let prev_pitch = prev_pred['HeadPitch'];
                    // for hw model
                    let new_pitch = 1.6 * -(prediction['HeadPitch'] - 0.5) / 1.;  // 0.8 for correction
                    // let new_pitch = 3.2 * -(prediction['HeadPitch'] - 0.5) / 1.;  // 0.8 for correction
                    prediction['HeadPitch'] = prev_pitch * 0.90 + new_pitch * 0.10;
                } else {
                    let prev_yaw = prev_pred[name];
                    let new_yaw = 1.6 * -(prediction[name] - 0.5) / 1.;
                    // let new_yaw = 3.2 * -(prediction[name] - 0.5) / 1.;
                    prediction[name] = prev_yaw * 0.90 + new_yaw * 0.10;
                }
            } else if (name.includes('Brow')) {
                let prev_yaw = prev_pred[name];
                let new_yaw = prediction[name];
                prediction[name] = prev_yaw * 0.5 + new_yaw * 0.5;
                // } else if (name.includes('Eye')) {
                //     prediction[name] = prediction[name] * 1.;
            } else if (name.includes('Mouth')) {
                let prev_yaw = prev_pred[name];
                let new_yaw = prediction[name];
                prediction[name] = prev_yaw * 0.5 + new_yaw * 0.5;
            }
        }
    }
    else {
        if ('HeadPitch' in prediction) {
            prediction['HeadPitch'] = -(prediction['HeadPitch'] - 0.5) / 1.;  // 0.8 for correction
        }
        if ('HeadYaw' in prediction) {
            prediction['HeadYaw'] = -(prediction['HeadYaw'] - 0.5) / 1.;
        }
        if ('HeadRoll' in prediction) {
            prediction['HeadRoll'] = -(prediction['HeadRoll'] - 0.5) / 1.;
        }
    }

    return prediction;
}

const main = async () => {
    // load blaze face detector
    blazeFaceDetector = new FaceDetector();
    await blazeFaceDetector.init()
    // load trained model
    facialExpressionModel = new FacialExpressionModel();
    await facialExpressionModel.init();
    // fps monitor
    fpsMonitor = new FpsMonitor();
    // load camera
    loadCameraFeed();
    // load three js model
    load3dModel(AVATAR_PATH);
    // load inference
    runInference();
}

main();
