import KalmanFilter from 'kalmanjs';
import { Quaternion } from '@hologramlabs/mocap4face';

// ---------------
// ---- Notes ----
// ---------------

// Face mesh landmark indices extracted from
// https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/src/mediapipe-facemesh/keypoints.ts

// ----------------
// ---- Basics ----
// ----------------

export const undefTo0 = (x: number | undefined) => {
  return typeof x === 'undefined' ? 0 : x;
};

export const clamp = (val: number, min: number, max: number) => {
  return Math.max(Math.min(val, max), min);
};

export const remap = (val: number, min: number, max: number) => {
  // min to max -> 0 to 1
  return (clamp(val, min, max) - min) / (max - min);
};

// Compute euclidean distance in 3d
export function getDistance(p1: any, p2: any) {
  return Math.sqrt(
    (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
  );
}

export function rangeTransform(
  inA: number,
  inB: number,
  outA: number,
  outB: number,
  inVal: number
) {
  // linearly transform [inA, inB] to [outA, outB]
  // Note: we assume inA < inB,
  if (inVal < inA) return outA;
  if (inVal > inB) return outB;
  return ((inVal - inA) / (inB - inA)) * (outB - outA) + outA;
}

export function applyMorphTargetTransform(
  inA: number,
  inB: number,
  outA: number,
  outB: number,
  inVal: number,
  morphTargets: any,
  morthTargetIndices: any
) {
  let transformVal = rangeTransform(inA, inB, outA, outB, inVal);
  for (const morphTarget of morphTargets) {
    for (const i of morthTargetIndices) {
      morphTarget[i] = transformVal;
    }
  }
}

// -----------------------------------------
// ---- Horizontally flip video display ----
// -----------------------------------------

export function flipBlendShapes(inputBlendShapes) {
  const blendShapesDict = {};
  for (const [name, value] of inputBlendShapes) {
    blendShapesDict[name] = value;
  }
  for (const [name, value] of inputBlendShapes) {
    if (name.endsWith('_L')) {
      const rightName = name.substr(0, name.length - 2) + '_R';
      blendShapesDict[name] = blendShapesDict[rightName];
      blendShapesDict[rightName] = value;
    }
  }
  return Object.entries(blendShapesDict);
}

// -----------------------------------
// ---- Face orientation estimate ----
// -----------------------------------

export class FaceRotationEstimator {
  private leftEye: number[];
  private rightEye: number[];
  private eyeCenter: number[];
  private faceCenter: number[];
  private xRotateKf: KalmanFilter;
  private yRotateKf: KalmanFilter;
  private zRotateKf: KalmanFilter;

  constructor({ R = 0.1, Q = 3 } = {}) {
    // init as 0, 1, 2.. so that all rotation is valid (no 0 division)
    // even without the update() call
    this.leftEye = [0, 0, 0];
    this.rightEye = [1, 1, 1];
    this.eyeCenter = [2, 2, 2];
    this.faceCenter = [3, 3, 3];
    this.xRotateKf = new KalmanFilter({ R: R, Q: Q });
    this.yRotateKf = new KalmanFilter({ R: R, Q: Q });
    this.zRotateKf = new KalmanFilter({ R: R, Q: Q });
  }
  update(landmarks: any) {
    this.leftEye = landmarks[263];
    this.rightEye = landmarks[33];
    let lipTop = landmarks[0];
    this.eyeCenter = [
      (this.leftEye[0] + this.rightEye[0]) / 2,
      (this.leftEye[1] + this.rightEye[1]) / 2,
      (this.leftEye[2] + this.rightEye[2]) / 2,
    ];
    this.faceCenter = [
      (this.eyeCenter[0] + lipTop[0]) / 2,
      (this.eyeCenter[1] + lipTop[1]) / 2,
      (this.eyeCenter[2] + lipTop[2]) / 2,
    ];
  }
  estimateRotationX() {
    // estimate rotation along the vertical axis (e.g., shake the head)
    let rotateX = Math.asin(
      (this.faceCenter[2] - this.eyeCenter[2]) /
        getDistance(this.faceCenter, this.eyeCenter)
    );
    return this.xRotateKf.filter(rotateX);
  }
  estimateRotationY() {
    // estimate rotation along the horizontal axis (e.g., nodding)
    let rotateY = Math.asin(
      (this.rightEye[2] - this.leftEye[2]) /
        getDistance(this.leftEye, this.rightEye)
    );
    return this.yRotateKf.filter(rotateY);
  }
  estimateRotationZ() {
    // estimate rotation along the perpendicular axis (i.e., rotate on
    // the screen surface)
    let rotateZ = Math.asin(
      (this.eyeCenter[0] - this.faceCenter[0]) /
        getDistance(this.faceCenter, this.eyeCenter)
    );
    return this.zRotateKf.filter(rotateZ);
  }
}

// -------------------------------------
// ---- Facial expression inference ----
// -------------------------------------
class FacialComponentSizeEstimator {
  private kf: KalmanFilter;

  public constructor({ R = 1, Q = 1 } = {}) {
    this.kf = new KalmanFilter({ R: R, Q: Q });
  }
  public estimateSize(
    landmarks: any,
    idxA: any,
    idxB: any,
    refIdxA: any,
    refIdxB: any
  ) {
    let rawEstimate = getDistance(landmarks[idxA], landmarks[idxB]);
    rawEstimate /= getDistance(landmarks[refIdxA], landmarks[refIdxB]);
    return this.kf.filter(rawEstimate);
  }
}

export class leftEyeOpenessEstimator {
  private faceKalmanFilter: KalmanFilter;
  private leftEyeUpperCenterIdx: number;
  private leftEyeLowerCenterIdx: number;
  private leftEyeLeftIdx: number;
  private leftEyeRightIdx: number;

  public constructor() {
    this.faceKalmanFilter = new FacialComponentSizeEstimator({ Q: 2 });
    this.leftEyeUpperCenterIdx = 386;
    this.leftEyeLowerCenterIdx = 374;
    this.leftEyeLeftIdx = 263;
    this.leftEyeRightIdx = 362;
  }
  public estimate(landmarks: any) {
    return this.faceKalmanFilter.estimateSize(
      landmarks,
      this.leftEyeUpperCenterIdx,
      this.leftEyeLowerCenterIdx,
      this.leftEyeLeftIdx,
      this.leftEyeRightIdx
    );
  }
}

export class rightEyeOpenessEstimator {
  private faceKalmanFilter: KalmanFilter;
  private rightEyeUpperCenterIdx: number;
  private rightEyeLowerCenterIdx: number;
  private rightEyeLeftIdx: number;
  private rightEyeRightIdx: number;

  public constructor() {
    this.faceKalmanFilter = new FacialComponentSizeEstimator({ Q: 2 });
    this.rightEyeUpperCenterIdx = 159;
    this.rightEyeLowerCenterIdx = 145;
    this.rightEyeLeftIdx = 133;
    this.rightEyeRightIdx = 33;
  }
  public estimate(landmarks: any) {
    return this.faceKalmanFilter.estimateSize(
      landmarks,
      this.rightEyeUpperCenterIdx,
      this.rightEyeLowerCenterIdx,
      this.rightEyeLeftIdx,
      this.rightEyeRightIdx
    );
  }
}

export class mouthOpenessEstimator {
  private faceKalmanFilter: KalmanFilter;
  private lipInnerUpperCenterIdx: number;
  private lipInnerLowerCenterIdx: number;
  private leftEyeRightRefIdx: number;
  private rightEyeLeftRefIdx: number;

  public constructor() {
    this.faceKalmanFilter = new FacialComponentSizeEstimator();
    this.lipInnerUpperCenterIdx = 13;
    this.lipInnerLowerCenterIdx = 14;
    this.leftEyeRightRefIdx = 362;
    this.rightEyeLeftRefIdx = 133;
  }
  public estimate(landmarks: any) {
    return this.faceKalmanFilter.estimateSize(
      landmarks,
      this.lipInnerUpperCenterIdx,
      this.lipInnerLowerCenterIdx,
      this.leftEyeRightRefIdx,
      this.rightEyeLeftRefIdx
    );
  }
}

export class mouthSmileEstimator {
  private faceKalmanFilter: KalmanFilter;
  private lipleftIdx: number;
  private lipRightIdx: number;
  private leftEyeRightRefIdx: number;
  private rightEyeLeftRefIdx: number;

  public constructor() {
    this.faceKalmanFilter = new FacialComponentSizeEstimator();
    this.lipleftIdx = 291;
    this.lipRightIdx = 61;
    this.leftEyeRightRefIdx = 362;
    this.rightEyeLeftRefIdx = 133;
  }
  public estimate(landmarks: any) {
    return this.faceKalmanFilter.estimateSize(
      landmarks,
      this.lipleftIdx,
      this.lipRightIdx,
      this.leftEyeRightRefIdx,
      this.rightEyeLeftRefIdx
    );
  }
}

// -----------------------------------------
// ---- Alter face model util functions ----
// -----------------------------------------
/**
 * Converts head rotation to blendshape-like values so that we can show it in the UI as well.
 * @param rotation rotation from the tracker
 * @returns rotation represented as 6 blendshapes
 */
export function faceRotationToBlendshapes(rotation: Quaternion) {
  let euler = rotation.toEuler();
  let halfPi = Math.PI * 0.5;
  return {
    headYaw: euler.y / halfPi,
    headPitch: euler.x / halfPi,
    headRoll: euler.z / halfPi,
  };
}

// -----------------------------------------
// ---- Extract morph target dictionary ----
// -----------------------------------------

function addDictIfExists(inDict: any, outDict: any, key: string) {
  if (key in inDict) {
    outDict[key] = inDict[key];
  }
}

function changeDictKeyIfExists(
  inDict: any,
  outDict: any,
  inKey: string,
  outKey: string
) {
  if (inKey in inDict) {
    outDict[outKey] = inDict[inKey];
  }
}

/**
 * Extract morph target name to index dictionary following Apple AR kit naming standard.
 * @param morphTargetDict input dictionary, which may be a superset of Apple morph targets.
 * @returns appleMorphTargetDict follows the Apple standard
 */
export function extractAppleMorphTargetDictionary(morphTargetDict: any) {
  const appleMorphTargetDict = {};
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeBlinkLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeLookUpLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeLookDownLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeLookInLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeLookOutLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeSquintLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeWideLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeBlinkRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeLookUpRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeLookDownRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeLookInRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeLookOutRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeSquintRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'eyeWideRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'jawOpen');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'jawForward');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'jawLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'jawRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthClose');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthFunnel');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthPucker');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthSmileLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthSmileRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthDimpleLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthDimpleRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthFrownLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthFrownRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthPressLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthPressRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthRollLower');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthRollUpper');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthShrugLower');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthShrugUpper');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthStretchLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthStretchRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthUpperUpLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthUpperUpRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthLowerDownLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'mouthLowerDownRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'browDownLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'browDownRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'browInnerUp');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'browOuterUpLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'browOuterUpRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'cheekPuff');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'cheekSquintLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'cheekSquintRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'noseSneerLeft');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'noseSneerRight');
  addDictIfExists(morphTargetDict, appleMorphTargetDict, 'tongueOut');
  return appleMorphTargetDict;
}

/**
 * Convert morph target naming standard from Apple to Alter.
 * @param appleDict apple morph target name to index.
 * @returns alterMorphTargetDict alter morph target name to index.
 */
export function appleFaceDictionaryTransform(appleDict: any) {
  const alterDict = {};
  changeDictKeyIfExists(appleDict, alterDict, 'eyeBlinkLeft', 'eyeBlink_L');
  changeDictKeyIfExists(appleDict, alterDict, 'eyeSquintLeft', 'eyeSquint_L');
  changeDictKeyIfExists(appleDict, alterDict, 'eyeWideLeft', 'eyeWide_L');
  changeDictKeyIfExists(appleDict, alterDict, 'eyeLookUpLeft', 'eyeLookUp_L');
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'eyeLookDownLeft',
    'eyeLookDown_L'
  );
  changeDictKeyIfExists(appleDict, alterDict, 'eyeLookInLeft', 'eyeLookIn_L');
  changeDictKeyIfExists(appleDict, alterDict, 'eyeLookOutLeft', 'eyeLookOut_L');
  changeDictKeyIfExists(appleDict, alterDict, 'eyeBlinkRight', 'eyeBlink_R');
  changeDictKeyIfExists(appleDict, alterDict, 'eyeSquintRight', 'eyeSquint_R');
  changeDictKeyIfExists(appleDict, alterDict, 'eyeWideRight', 'eyeWide_R');
  changeDictKeyIfExists(appleDict, alterDict, 'eyeLookUpRight', 'eyeLookUp_R');
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'eyeLookDownRight',
    'eyeLookDown_R'
  );
  changeDictKeyIfExists(appleDict, alterDict, 'eyeLookInRight', 'eyeLookIn_R');
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'eyeLookOutRight',
    'eyeLookOut_R'
  );
  changeDictKeyIfExists(appleDict, alterDict, 'jawOpen', 'jawOpen');
  changeDictKeyIfExists(appleDict, alterDict, 'jawLeft', 'jawLeft');
  changeDictKeyIfExists(appleDict, alterDict, 'jawRight', 'jawRight');
  changeDictKeyIfExists(appleDict, alterDict, 'mouthLeft', 'mouthLeft');
  changeDictKeyIfExists(appleDict, alterDict, 'mouthRight', 'mouthRight');
  changeDictKeyIfExists(appleDict, alterDict, 'mouthFunnel', 'mouthFunnel');
  changeDictKeyIfExists(appleDict, alterDict, 'mouthPucker', 'mouthPucker');
  changeDictKeyIfExists(appleDict, alterDict, 'mouthSmileLeft', 'mouthSmile_L');
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthSmileRight',
    'mouthSmile_R'
  );
  changeDictKeyIfExists(appleDict, alterDict, 'mouthFrownLeft', 'mouthFrown_L');
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthFrownRight',
    'mouthFrown_R'
  );
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthRollLower',
    'mouthRollLower'
  );
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthRollUpper',
    'mouthRollUpper'
  );
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthShrugUpper',
    'mouthShrugUpper'
  );
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthUpperUpLeft',
    'mouthUpperUp_L'
  );
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthUpperUpRight',
    'mouthUpperUp_R'
  );
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthLowerDownLeft',
    'mouthLowerDown_L'
  );
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'mouthLowerDownRight',
    'mouthLowerDown_R'
  );
  changeDictKeyIfExists(appleDict, alterDict, 'browDownLeft', 'browDown_L');
  changeDictKeyIfExists(appleDict, alterDict, 'browDownRight', 'browDown_R');
  changeDictKeyIfExists(appleDict, alterDict, 'browInnerUp', 'browInnerUp_L'); // hack
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'browOuterUpLeft',
    'browOuterUp_L'
  );
  changeDictKeyIfExists(
    appleDict,
    alterDict,
    'browOuterUpRight',
    'browOuterUp_R'
  );
  changeDictKeyIfExists(appleDict, alterDict, 'cheekPuff', 'cheekPuff');
  changeDictKeyIfExists(appleDict, alterDict, 'noseSneerLeft', 'noseSneer_L');
  changeDictKeyIfExists(appleDict, alterDict, 'noseSneerRight', 'noseSneer_R');

  return alterDict;
}
