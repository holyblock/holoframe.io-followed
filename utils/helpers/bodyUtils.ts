import * as THREE from 'three';

const defaultBodyConfig = {
  BONE: 'Bone',
  HIPS: 'Hips',
  SPINE: 'Spine',
  SPINE_1: 'Spine1',
  SPINE_2: 'Spine2',
  LEFT_SHOULDER: 'LeftShoulder',
  RIGHT_SHOULDER: 'RightShoulder',
  LEFT_ARM: 'LeftArm',
  LEFT_FORE_ARM: 'LeftForeArm',
  LEFT_HAND: 'LeftHand',
  LEFT_THUMB_1: 'LeftHandThumb1',
  LEFT_THUMB_2: 'LeftHandThumb2',
  LEFT_THUMB_3: 'LeftHandThumb3',
  LEFT_INDEX_1: 'LeftHandIndex1',
  LEFT_INDEX_2: 'LeftHandIndex2',
  LEFT_INDEX_3: 'LeftHandIndex3',
  LEFT_MIDDLE_1: 'LeftHandMiddle1',
  LEFT_MIDDLE_2: 'LeftHandMiddle2',
  LEFT_MIDDLE_3: 'LeftHandMiddle3',
  LEFT_RING_1: 'LeftHandRing1',
  LEFT_RING_2: 'LeftHandRing2',
  LEFT_RING_3: 'LeftHandRing3',
  LEFT_PINKY_1: 'LeftHandPinky1',
  LEFT_PINKY_2: 'LeftHandPinky2',
  LEFT_PINKY_3: 'LeftHandPinky3',
  RIGHT_ARM: 'RightArm',
  RIGHT_FORE_ARM: 'RightForeArm',
  RIGHT_HAND: 'RightHand',
  RIGHT_THUMB_1: 'RightHandThumb1',
  RIGHT_THUMB_2: 'RightHandThumb2',
  RIGHT_THUMB_3: 'RightHandThumb3',
  RIGHT_INDEX_1: 'RightHandIndex1',
  RIGHT_INDEX_2: 'RightHandIndex2',
  RIGHT_INDEX_3: 'RightHandIndex3',
  RIGHT_MIDDLE_1: 'RightHandMiddle1',
  RIGHT_MIDDLE_2: 'RightHandMiddle2',
  RIGHT_MIDDLE_3: 'RightHandMiddle3',
  RIGHT_RING_1: 'RightHandRing1',
  RIGHT_RING_2: 'RightHandRing2',
  RIGHT_RING_3: 'RightHandRing3',
  RIGHT_PINKY_1: 'RightHandPinky1',
  RIGHT_PINKY_2: 'RightHandPinky2',
  RIGHT_PINKY_3: 'RightHandPinky3',
  LEFT_UP_LEG: 'LeftUpLeg',
  LEFT_LEG: 'LeftLeg',
  RIGHT_UP_LEG: 'RightUpLeg',
  RIGHT_LEG: 'RightLeg',
  XZY: 'XZY',
  ZYX: 'ZYX',
  VRM_HIPS: 'C_Hips',
  VRM_SPINE: 'C_Spine',
  VRM_SPINE_1: 'C_Chest',
  VRM_SPINE_2: 'C_UpperChest',
  VRM_LEFT_SHOULDER: 'L_Shoulder',
  VRM_RIGHT_SHOULDER: 'R_Shoulder',
  VRM_LEFT_UP_LEG: 'L_UpperLeg',
  VRM_LEFT_LEG: 'L_LowerLeg',
  VRM_RIGHT_UP_LEG: 'R_UpperLeg',
  VRM_RIGHT_LEG: 'R_LowerLeg',
  VRM_LEFT_ARM: 'L_UpperArm',
  VRM_LEFT_FORE_ARM: 'L_LowerArm',
  VRM_LEFT_HAND: 'L_Hand',
  VRM_LEFT_THUMB_1: 'L_Thumb1',
  VRM_LEFT_THUMB_2: 'L_Thumb2',
  VRM_LEFT_THUMB_3: 'L_Thumb3',
  VRM_LEFT_INDEX_1: 'L_Index1',
  VRM_LEFT_INDEX_2: 'L_Index2',
  VRM_LEFT_INDEX_3: 'L_Index3',
  VRM_LEFT_MIDDLE_1: 'L_Middle1',
  VRM_LEFT_MIDDLE_2: 'L_Middle2',
  VRM_LEFT_MIDDLE_3: 'L_Middle3',
  VRM_LEFT_RING_1: 'L_Ring1',
  VRM_LEFT_RING_2: 'L_Ring2',
  VRM_LEFT_RING_3: 'L_Ring3',
  VRM_LEFT_PINKY_1: 'L_Little1',
  VRM_LEFT_PINKY_2: 'L_Little2',
  VRM_LEFT_PINKY_3: 'L_Little3',
  VRM_RIGHT_ARM: 'R_UpperArm',
  VRM_RIGHT_FORE_ARM: 'R_LowerArm',
  VRM_RIGHT_HAND: 'R_Hand',
  VRM_RIGHT_THUMB_1: 'R_Thumb1',
  VRM_RIGHT_THUMB_2: 'R_Thumb2',
  VRM_RIGHT_THUMB_3: 'R_Thumb3',
  VRM_RIGHT_INDEX_1: 'R_Index1',
  VRM_RIGHT_INDEX_2: 'R_Index2',
  VRM_RIGHT_INDEX_3: 'R_Index3',
  VRM_RIGHT_MIDDLE_1: 'R_Middle1',
  VRM_RIGHT_MIDDLE_2: 'R_Middle2',
  VRM_RIGHT_MIDDLE_3: 'R_Middle3',
  VRM_RIGHT_RING_1: 'R_Ring1',
  VRM_RIGHT_RING_2: 'R_Ring2',
  VRM_RIGHT_RING_3: 'R_Ring3',
  VRM_RIGHT_PINKY_1: 'R_Little1',
  VRM_RIGHT_PINKY_2: 'R_Little2',
  VRM_RIGHT_PINKY_3: 'R_Little3',
};

// mapping from VRM or GLTF bone name standard to GLTF standard
const boneNameMap = {};
boneNameMap[defaultBodyConfig.VRM_HIPS] = defaultBodyConfig.HIPS;
boneNameMap[defaultBodyConfig.VRM_SPINE] = defaultBodyConfig.SPINE;
boneNameMap[defaultBodyConfig.VRM_SPINE_1] = defaultBodyConfig.SPINE_1;
boneNameMap[defaultBodyConfig.VRM_SPINE_2] = defaultBodyConfig.SPINE_2;
boneNameMap[defaultBodyConfig.VRM_LEFT_SHOULDER] =
  defaultBodyConfig.LEFT_SHOULDER;
boneNameMap[defaultBodyConfig.VRM_RIGHT_SHOULDER] =
  defaultBodyConfig.RIGHT_SHOULDER;
boneNameMap[defaultBodyConfig.VRM_LEFT_UP_LEG] = defaultBodyConfig.LEFT_UP_LEG;
boneNameMap[defaultBodyConfig.VRM_LEFT_LEG] = defaultBodyConfig.LEFT_LEG;
boneNameMap[defaultBodyConfig.VRM_RIGHT_UP_LEG] =
  defaultBodyConfig.RIGHT_UP_LEG;
boneNameMap[defaultBodyConfig.VRM_RIGHT_LEG] = defaultBodyConfig.RIGHT_LEG;
boneNameMap[defaultBodyConfig.VRM_RIGHT_SHOULDER] =
  defaultBodyConfig.RIGHT_SHOULDER;
boneNameMap[defaultBodyConfig.VRM_LEFT_ARM] = defaultBodyConfig.LEFT_ARM;
boneNameMap[defaultBodyConfig.VRM_LEFT_FORE_ARM] =
  defaultBodyConfig.LEFT_FORE_ARM;
boneNameMap[defaultBodyConfig.VRM_LEFT_HAND] = defaultBodyConfig.LEFT_HAND;
boneNameMap[defaultBodyConfig.VRM_LEFT_THUMB_1] =
  defaultBodyConfig.LEFT_THUMB_1;
boneNameMap[defaultBodyConfig.VRM_LEFT_THUMB_2] =
  defaultBodyConfig.LEFT_THUMB_2;
boneNameMap[defaultBodyConfig.VRM_LEFT_THUMB_3] =
  defaultBodyConfig.LEFT_THUMB_3;
boneNameMap[defaultBodyConfig.VRM_LEFT_INDEX_1] =
  defaultBodyConfig.LEFT_INDEX_1;
boneNameMap[defaultBodyConfig.VRM_LEFT_INDEX_2] =
  defaultBodyConfig.LEFT_INDEX_2;
boneNameMap[defaultBodyConfig.VRM_LEFT_INDEX_3] =
  defaultBodyConfig.LEFT_INDEX_3;
boneNameMap[defaultBodyConfig.VRM_LEFT_MIDDLE_1] =
  defaultBodyConfig.LEFT_MIDDLE_1;
boneNameMap[defaultBodyConfig.VRM_LEFT_MIDDLE_2] =
  defaultBodyConfig.LEFT_MIDDLE_2;
boneNameMap[defaultBodyConfig.VRM_LEFT_MIDDLE_3] =
  defaultBodyConfig.LEFT_MIDDLE_3;
boneNameMap[defaultBodyConfig.VRM_LEFT_RING_1] = defaultBodyConfig.LEFT_RING_1;
boneNameMap[defaultBodyConfig.VRM_LEFT_RING_2] = defaultBodyConfig.LEFT_RING_2;
boneNameMap[defaultBodyConfig.VRM_LEFT_RING_3] = defaultBodyConfig.LEFT_RING_3;
boneNameMap[defaultBodyConfig.VRM_LEFT_PINKY_1] =
  defaultBodyConfig.LEFT_PINKY_1;
boneNameMap[defaultBodyConfig.VRM_LEFT_PINKY_2] =
  defaultBodyConfig.LEFT_PINKY_2;
boneNameMap[defaultBodyConfig.VRM_LEFT_PINKY_3] =
  defaultBodyConfig.LEFT_PINKY_3;
boneNameMap[defaultBodyConfig.VRM_RIGHT_ARM] = defaultBodyConfig.RIGHT_ARM;
boneNameMap[defaultBodyConfig.VRM_RIGHT_FORE_ARM] =
  defaultBodyConfig.RIGHT_FORE_ARM;
boneNameMap[defaultBodyConfig.VRM_RIGHT_HAND] = defaultBodyConfig.RIGHT_HAND;
boneNameMap[defaultBodyConfig.VRM_RIGHT_THUMB_1] =
  defaultBodyConfig.RIGHT_THUMB_1;
boneNameMap[defaultBodyConfig.VRM_RIGHT_THUMB_2] =
  defaultBodyConfig.RIGHT_THUMB_2;
boneNameMap[defaultBodyConfig.VRM_RIGHT_THUMB_3] =
  defaultBodyConfig.RIGHT_THUMB_3;
boneNameMap[defaultBodyConfig.VRM_RIGHT_INDEX_1] =
  defaultBodyConfig.RIGHT_INDEX_1;
boneNameMap[defaultBodyConfig.VRM_RIGHT_INDEX_2] =
  defaultBodyConfig.RIGHT_INDEX_2;
boneNameMap[defaultBodyConfig.VRM_RIGHT_INDEX_3] =
  defaultBodyConfig.RIGHT_INDEX_3;
boneNameMap[defaultBodyConfig.VRM_RIGHT_MIDDLE_1] =
  defaultBodyConfig.RIGHT_MIDDLE_1;
boneNameMap[defaultBodyConfig.VRM_RIGHT_MIDDLE_2] =
  defaultBodyConfig.RIGHT_MIDDLE_2;
boneNameMap[defaultBodyConfig.VRM_RIGHT_MIDDLE_3] =
  defaultBodyConfig.RIGHT_MIDDLE_3;
boneNameMap[defaultBodyConfig.VRM_RIGHT_RING_1] =
  defaultBodyConfig.RIGHT_RING_1;
boneNameMap[defaultBodyConfig.VRM_RIGHT_RING_2] =
  defaultBodyConfig.RIGHT_RING_2;
boneNameMap[defaultBodyConfig.VRM_RIGHT_RING_3] =
  defaultBodyConfig.RIGHT_RING_3;
boneNameMap[defaultBodyConfig.VRM_RIGHT_PINKY_1] =
  defaultBodyConfig.RIGHT_PINKY_1;
boneNameMap[defaultBodyConfig.VRM_RIGHT_PINKY_2] =
  defaultBodyConfig.RIGHT_PINKY_2;
boneNameMap[defaultBodyConfig.VRM_RIGHT_PINKY_3] =
  defaultBodyConfig.RIGHT_PINKY_3;

boneNameMap[defaultBodyConfig.SPINE] = defaultBodyConfig.SPINE;
boneNameMap[defaultBodyConfig.SPINE_1] = defaultBodyConfig.SPINE_1;
boneNameMap[defaultBodyConfig.SPINE_2] = defaultBodyConfig.SPINE_2;
boneNameMap[defaultBodyConfig.LEFT_SHOULDER] = defaultBodyConfig.LEFT_SHOULDER;
boneNameMap[defaultBodyConfig.RIGHT_SHOULDER] =
  defaultBodyConfig.RIGHT_SHOULDER;
boneNameMap[defaultBodyConfig.LEFT_ARM] = defaultBodyConfig.LEFT_ARM;
boneNameMap[defaultBodyConfig.LEFT_FORE_ARM] = defaultBodyConfig.LEFT_FORE_ARM;
boneNameMap[defaultBodyConfig.LEFT_HAND] = defaultBodyConfig.LEFT_HAND;
boneNameMap[defaultBodyConfig.LEFT_THUMB_1] = defaultBodyConfig.LEFT_THUMB_1;
boneNameMap[defaultBodyConfig.LEFT_THUMB_2] = defaultBodyConfig.LEFT_THUMB_2;
boneNameMap[defaultBodyConfig.LEFT_THUMB_3] = defaultBodyConfig.LEFT_THUMB_3;
boneNameMap[defaultBodyConfig.LEFT_INDEX_1] = defaultBodyConfig.LEFT_INDEX_1;
boneNameMap[defaultBodyConfig.LEFT_INDEX_2] = defaultBodyConfig.LEFT_INDEX_2;
boneNameMap[defaultBodyConfig.LEFT_INDEX_3] = defaultBodyConfig.LEFT_INDEX_3;
boneNameMap[defaultBodyConfig.LEFT_MIDDLE_1] = defaultBodyConfig.LEFT_MIDDLE_1;
boneNameMap[defaultBodyConfig.LEFT_MIDDLE_2] = defaultBodyConfig.LEFT_MIDDLE_2;
boneNameMap[defaultBodyConfig.LEFT_MIDDLE_3] = defaultBodyConfig.LEFT_MIDDLE_3;
boneNameMap[defaultBodyConfig.LEFT_RING_1] = defaultBodyConfig.LEFT_RING_1;
boneNameMap[defaultBodyConfig.LEFT_RING_2] = defaultBodyConfig.LEFT_RING_2;
boneNameMap[defaultBodyConfig.LEFT_RING_3] = defaultBodyConfig.LEFT_RING_3;
boneNameMap[defaultBodyConfig.LEFT_PINKY_1] = defaultBodyConfig.LEFT_PINKY_1;
boneNameMap[defaultBodyConfig.LEFT_PINKY_2] = defaultBodyConfig.LEFT_PINKY_2;
boneNameMap[defaultBodyConfig.LEFT_PINKY_3] = defaultBodyConfig.LEFT_PINKY_3;
boneNameMap[defaultBodyConfig.RIGHT_ARM] = defaultBodyConfig.RIGHT_ARM;
boneNameMap[defaultBodyConfig.RIGHT_FORE_ARM] =
  defaultBodyConfig.RIGHT_FORE_ARM;
boneNameMap[defaultBodyConfig.RIGHT_HAND] = defaultBodyConfig.RIGHT_HAND;
boneNameMap[defaultBodyConfig.RIGHT_THUMB_1] = defaultBodyConfig.RIGHT_THUMB_1;
boneNameMap[defaultBodyConfig.RIGHT_THUMB_2] = defaultBodyConfig.RIGHT_THUMB_2;
boneNameMap[defaultBodyConfig.RIGHT_THUMB_3] = defaultBodyConfig.RIGHT_THUMB_3;
boneNameMap[defaultBodyConfig.RIGHT_INDEX_1] = defaultBodyConfig.RIGHT_INDEX_1;
boneNameMap[defaultBodyConfig.RIGHT_INDEX_2] = defaultBodyConfig.RIGHT_INDEX_2;
boneNameMap[defaultBodyConfig.RIGHT_INDEX_3] = defaultBodyConfig.RIGHT_INDEX_3;
boneNameMap[defaultBodyConfig.RIGHT_MIDDLE_1] =
  defaultBodyConfig.RIGHT_MIDDLE_1;
boneNameMap[defaultBodyConfig.RIGHT_MIDDLE_2] =
  defaultBodyConfig.RIGHT_MIDDLE_2;
boneNameMap[defaultBodyConfig.RIGHT_MIDDLE_3] =
  defaultBodyConfig.RIGHT_MIDDLE_3;
boneNameMap[defaultBodyConfig.RIGHT_RING_1] = defaultBodyConfig.RIGHT_RING_1;
boneNameMap[defaultBodyConfig.RIGHT_RING_2] = defaultBodyConfig.RIGHT_RING_2;
boneNameMap[defaultBodyConfig.RIGHT_RING_3] = defaultBodyConfig.RIGHT_RING_3;
boneNameMap[defaultBodyConfig.RIGHT_PINKY_1] = defaultBodyConfig.RIGHT_PINKY_1;
boneNameMap[defaultBodyConfig.RIGHT_PINKY_2] = defaultBodyConfig.RIGHT_PINKY_2;
boneNameMap[defaultBodyConfig.RIGHT_PINKY_3] = defaultBodyConfig.RIGHT_PINKY_3;

// pass in a VRM node name (substring matching) or GLTF node name (exact match),
// output the correct GLTF node name
const boneNameKeys = Object.values(defaultBodyConfig);
const boneNameMapToGltf = (boneName: string) => {
  for (const boneNameKey of boneNameKeys) {
    if (boneName.includes(boneNameKey)) {
      return boneNameMap[boneNameKey];
    }
  }
  return null;
};

// convert from display coordinate system (output from mediapipe)
// to avatar world coordinate system (first person view from avatar),
// default is avatar facing outward to the display, x positive from display
// right to avatar left (unchanged), y positive from display down to avatar
// up (flipped), z positive from display inwards to avatar front (flipped)
const displayToAvatarWorldMatrix = new THREE.Matrix4();
displayToAvatarWorldMatrix.set(
  1,
  0,
  0,
  0,
  0,
  -1,
  0,
  0,
  0,
  0,
  -1,
  0,
  0,
  0,
  0,
  1
);
const vrmDisplayToAvatarWorldMatrix = new THREE.Matrix4();
vrmDisplayToAvatarWorldMatrix.set(
  -1,
  0,
  0,
  0,
  0,
  -1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1
);

const applyQt = (node: THREE.Object3D, qt: THREE.Quaternion) => {
  node.quaternion.w = qt.w;
  node.quaternion.x = qt.x;
  node.quaternion.y = qt.y;
  node.quaternion.z = qt.z;
  // keep the position and scale, apply only the rotation through quaternion
  node.matrix.compose(node.position, node.quaternion, node.scale);
  // update matrix and matrix world to affect the child nodes
  node.updateMatrix();
  node.updateMatrixWorld();
};

const applyRotation = (node: THREE.Object3D, mat: THREE.Matrix4) => {
  // Note the reason we can't directly apply matrix to node for rotation
  // is 1. regular rotation matrix only rotates (not scales or shifts) a
  // vector, whereas the node's own matrix might have inherent scale and
  // shift; 2. the rotation on a node should affect the child nodes as well.
  const qt = new THREE.Quaternion();
  qt.setFromRotationMatrix(mat);
  applyQt(node, qt);
};

const diffVector = (landmark: any, startIdx: number, endIdx: number) => {
  const x = landmark[endIdx].x - landmark[startIdx].x;
  const y = landmark[endIdx].y - landmark[startIdx].y;
  const z = landmark[endIdx].z - landmark[startIdx].z;
  return new THREE.Vector3(x, y, z);
};

const calculateRoatationFromVectorDiff = (
  node: THREE.Object3D,
  displayParentVector: THREE.Vector3,
  displayChildVector: THREE.Vector3,
  isVRM: boolean
) => {
  // transform to avatar coordinate
  if (!isVRM) {
    displayParentVector.applyMatrix4(displayToAvatarWorldMatrix);
    displayChildVector.applyMatrix4(displayToAvatarWorldMatrix);
  } else {
    displayParentVector.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
    displayChildVector.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
  }
  // avatar world coordinate to parent node local coordinate
  const parentPosition = new THREE.Vector3();
  const parentQt = new THREE.Quaternion();
  const parentScale = new THREE.Vector3();
  const WorldToParentLocal = node.parent.matrixWorld.clone();
  // need invert because we apply matrix to vector, not the underlying
  // coordinate system
  WorldToParentLocal.invert();
  WorldToParentLocal.decompose(parentPosition, parentQt, parentScale);
  displayParentVector.applyQuaternion(parentQt);
  displayChildVector.applyQuaternion(parentQt);
  // normalize to set unit vectors
  displayParentVector.normalize();
  displayChildVector.normalize();
  const qt = new THREE.Quaternion();
  qt.setFromUnitVectors(displayParentVector, displayChildVector);
  return qt;
};

const applyRotationFromVectorDiff = (
  node: THREE.Object3D,
  displayParentVector: THREE.Vector3,
  displayChildVector: THREE.Vector3,
  isVRM: boolean
) => {
  const qt = calculateRoatationFromVectorDiff(
    node,
    displayParentVector,
    displayChildVector,
    isVRM
  );
  applyQt(node, qt);
};

const applyRotationFromVectorDiffUpLeg = (
  node: THREE.Object3D,
  displayParentVector: THREE.Vector3,
  displayChildVector: THREE.Vector3,
  isVRM: boolean
) => {
  const qt = calculateRoatationFromVectorDiff(
    node,
    displayParentVector,
    displayChildVector,
    isVRM
  );
  // add constraint
  const eulerAngle = new THREE.Euler();
  eulerAngle.setFromQuaternion(qt, defaultBodyConfig.XZY);
  // z is left / right, limit to [-45, 45]
  eulerAngle.z = Math.max(
    Math.min((45 / 180) * Math.PI, eulerAngle.z),
    (-45 / 180) * Math.PI
  );
  if (!isVRM) {
    // y is along the leg, fix to pi
    eulerAngle.y = Math.PI;
    // constraint x to [-100, 100]
    eulerAngle.x += 2 * Math.PI;
    eulerAngle.x %= 2 * Math.PI; // (x + 360) % 360 is the same, for easier calculation
    eulerAngle.x = Math.min(
      Math.max((80 / 180) * Math.PI, eulerAngle.x),
      (280 / 180) * Math.PI
    );
  } else {
    eulerAngle.y = 0;
    eulerAngle.x = Math.max(
      Math.min((100 / 180) * Math.PI, eulerAngle.x),
      (-100 / 180) * Math.PI
    );
  }
  qt.setFromEuler(eulerAngle);
  applyQt(node, qt);
};

const applyRotationFromVectorDiffLeg = (
  node: THREE.Object3D,
  displayParentVector: THREE.Vector3,
  displayChildVector: THREE.Vector3,
  isVRM: boolean
) => {
  const qt = calculateRoatationFromVectorDiff(
    node,
    displayParentVector,
    displayChildVector,
    isVRM
  );
  // add constraint
  const eulerAngle = new THREE.Euler();
  eulerAngle.setFromQuaternion(qt, defaultBodyConfig.XZY);
  eulerAngle.y = 0;
  qt.setFromEuler(eulerAngle);
  applyQt(node, qt);
};

const applyRotationFromVectorDiffConstraintFinger = (
  node: THREE.Object3D,
  displayParentVector: THREE.Vector3,
  displayChildVector: THREE.Vector3,
  isVRM: boolean,
  isRightHand: boolean
) => {
  const qt = calculateRoatationFromVectorDiff(
    node,
    displayParentVector,
    displayChildVector,
    isVRM
  );
  // add constraint
  const eulerAngle = new THREE.Euler();
  eulerAngle.setFromQuaternion(qt, defaultBodyConfig.XZY);
  if (!isVRM) {
    eulerAngle.y = Math.max(
      Math.min((5 / 180) * Math.PI, eulerAngle.y),
      (-5 / 180) * Math.PI
    );
    eulerAngle.x = Math.abs(eulerAngle.x) + Math.abs(eulerAngle.z);
    eulerAngle.x = Math.max(
      Math.min((90 / 180) * Math.PI, eulerAngle.x),
      (-10 / 180) * Math.PI
    );
    eulerAngle.z = Math.max(
      Math.min((5 / 180) * Math.PI, eulerAngle.z),
      (-5 / 180) * Math.PI
    );
  } else {
    eulerAngle.x = Math.max(
      Math.min((5 / 180) * Math.PI, eulerAngle.x),
      (-5 / 180) * Math.PI
    );
    eulerAngle.z = Math.abs(eulerAngle.z) + Math.abs(eulerAngle.y);
    eulerAngle.z = Math.max(
      Math.min((90 / 180) * Math.PI, eulerAngle.z),
      (-10 / 180) * Math.PI
    );
    if (isRightHand) {
      eulerAngle.z = -eulerAngle.z;
    }
    eulerAngle.y = Math.max(
      Math.min((5 / 180) * Math.PI, eulerAngle.y),
      (-5 / 180) * Math.PI
    );
  }
  qt.setFromEuler(eulerAngle);
  applyQt(node, qt);
};

const rotateHandAndForearm = (
  palmNormalX: THREE.Vector3,
  palmNormalY: THREE.Vector3,
  palmNormalZ: THREE.Vector3,
  handNode: THREE.Object3D,
  isVRM: boolean
) => {
  // find avatar coordinate transformation from spine to hand
  const spineToHandCoordinateTransform = new THREE.Matrix4();
  spineToHandCoordinateTransform.set(
    palmNormalX.x,
    palmNormalY.x,
    palmNormalZ.x,
    0,
    palmNormalX.y,
    palmNormalY.y,
    palmNormalZ.y,
    0,
    palmNormalX.z,
    palmNormalY.z,
    palmNormalZ.z,
    0,
    0,
    0,
    0,
    1
  );

  // now from the hand orientation, we first rotate the forearm to make
  // the hand rotation more continuous and natural (i.e., no twisting
  // hand on a fixed forearm)

  // find forearm's rotation matrix under its local coordinate
  const forearmMatrixWorld = handNode.parent.matrixWorld.clone();
  // note that M_wp * M_n = M_wn, thus M_n = M_wp ^ (-1) * M_wn
  forearmMatrixWorld.invert();
  const forearmToHandLocal = new THREE.Matrix4();
  forearmToHandLocal.multiplyMatrices(
    forearmMatrixWorld,
    spineToHandCoordinateTransform
  );

  // rotate forearm
  const forearmQt = new THREE.Quaternion();
  forearmQt.setFromRotationMatrix(forearmToHandLocal);
  const forearmDesiredEulerAngle = new THREE.Euler();
  if (!isVRM) {
    forearmDesiredEulerAngle.setFromQuaternion(
      forearmQt,
      defaultBodyConfig.XZY
    );
    const forearmOriginalEulerAngle = new THREE.Euler();
    forearmOriginalEulerAngle.setFromQuaternion(
      handNode.parent.quaternion,
      defaultBodyConfig.XZY
    );
    forearmOriginalEulerAngle.y = forearmDesiredEulerAngle.y;
    forearmQt.setFromEuler(forearmOriginalEulerAngle);
  } else {
    forearmDesiredEulerAngle.setFromQuaternion(
      forearmQt,
      defaultBodyConfig.ZYX
    );
    const forearmOriginalEulerAngle = new THREE.Euler();
    forearmOriginalEulerAngle.setFromQuaternion(
      handNode.parent.quaternion,
      defaultBodyConfig.ZYX
    );
    forearmOriginalEulerAngle.x = forearmDesiredEulerAngle.x;
    forearmQt.setFromEuler(forearmOriginalEulerAngle);
  }
  applyQt(handNode.parent, forearmQt);

  // based on forearm rotation (thus new matrix world), rotate hand
  const handQt = new THREE.Quaternion();
  forearmMatrixWorld.copy(handNode.parent.matrixWorld.clone());
  // same as above, since M_wp * M_n = M_wn, thus M_n = M_wp ^ (-1) * M_wn
  forearmMatrixWorld.invert();
  forearmToHandLocal.multiplyMatrices(
    forearmMatrixWorld,
    spineToHandCoordinateTransform
  );
  handQt.setFromRotationMatrix(forearmToHandLocal);
  applyQt(handNode, handQt);
};

const rotateThumb = (
  handLandmark: any,
  palmNormalY: THREE.Vector3,
  fingerNode1: THREE.Object3D,
  fingerNode2: THREE.Object3D,
  fingerNode3: THREE.Object3D,
  fingerLandmarkIndex0: number,
  fingerLandmarkIndex1: number,
  fingerLandmarkIndex2: number,
  fingerLandmarkIndex3: number,
  TShapeMatrixDict: any,
  isVRM: boolean
) => {
  if (handLandmark) {
    const fingerVecDiff1 = diffVector(
      handLandmark,
      fingerLandmarkIndex0,
      fingerLandmarkIndex1
    );
    const fingerVecDiff2 = diffVector(
      handLandmark,
      fingerLandmarkIndex1,
      fingerLandmarkIndex2
    );
    const fingerVecDiff3 = diffVector(
      handLandmark,
      fingerLandmarkIndex2,
      fingerLandmarkIndex3
    );
    // rotate based on vector diff
    applyRotationFromVectorDiff(
      fingerNode1,
      palmNormalY.clone(),
      fingerVecDiff1.clone(),
      isVRM
    );
    applyRotationFromVectorDiff(
      fingerNode2,
      fingerVecDiff1.clone(),
      fingerVecDiff2.clone(),
      isVRM
    );
    applyRotationFromVectorDiff(
      fingerNode3,
      fingerVecDiff2.clone(),
      fingerVecDiff3.clone(),
      isVRM
    );
  } else {
    // missing hand landmark detection, revert finger position to original
    const qt = new THREE.Quaternion();
    qt.setFromRotationMatrix(TShapeMatrixDict[fingerNode1.name]);
    applyQt(fingerNode1, qt);
    qt.setFromRotationMatrix(TShapeMatrixDict[fingerNode2.name]);
    applyQt(fingerNode2, qt);
    qt.setFromRotationMatrix(TShapeMatrixDict[fingerNode3.name]);
    applyQt(fingerNode3, qt);
  }
};

const rotateFingers = (
  handLandmark: any,
  palmNormalY: THREE.Vector3,
  fingerNode1: THREE.Object3D,
  fingerNode2: THREE.Object3D,
  fingerNode3: THREE.Object3D,
  fingerLandmarkIndex0: number,
  fingerLandmarkIndex1: number,
  fingerLandmarkIndex2: number,
  fingerLandmarkIndex3: number,
  TShapeMatrixDict: any,
  isVRM: boolean,
  isRightHand: boolean
) => {
  if (handLandmark) {
    const fingerVecDiff1 = diffVector(
      handLandmark,
      fingerLandmarkIndex0,
      fingerLandmarkIndex1
    );
    const fingerVecDiff2 = diffVector(
      handLandmark,
      fingerLandmarkIndex1,
      fingerLandmarkIndex2
    );
    const fingerVecDiff3 = diffVector(
      handLandmark,
      fingerLandmarkIndex2,
      fingerLandmarkIndex3
    );
    // rotate based on vector diff
    applyRotationFromVectorDiffConstraintFinger(
      fingerNode1,
      palmNormalY.clone(),
      fingerVecDiff1.clone(),
      isVRM,
      isRightHand
    );
    applyRotationFromVectorDiffConstraintFinger(
      fingerNode2,
      fingerVecDiff1.clone(),
      fingerVecDiff2.clone(),
      isVRM,
      isRightHand
    );
    applyRotationFromVectorDiffConstraintFinger(
      fingerNode3,
      fingerVecDiff2.clone(),
      fingerVecDiff3.clone(),
      isVRM,
      isRightHand
    );
  } else {
    // missing hand landmark detection, revert finger position to original
    const qt = new THREE.Quaternion();
    qt.setFromRotationMatrix(TShapeMatrixDict[fingerNode1.name]);
    applyQt(fingerNode1, qt);
    qt.setFromRotationMatrix(TShapeMatrixDict[fingerNode2.name]);
    applyQt(fingerNode2, qt);
    qt.setFromRotationMatrix(TShapeMatrixDict[fingerNode3.name]);
    applyQt(fingerNode3, qt);
  }
};

export default class BodyTracker {
  private bones: any;

  private bodyConfig: any;

  private TShapeMatrixDict: any;

  private TShapeMatrixWorldDict: any;

  private isVRM: boolean;

  private isFullBody: boolean;

  public constructor(config?: any) {
    this.bones = {};
    this.TShapeMatrixDict = {};
    this.TShapeMatrixWorldDict = {};
    this.isFullBody = false; // default tracking on arm and hand only
    this.bodyConfig = defaultBodyConfig;

    if (config) {
      for (const key in config) {
        if (key && this.bodyConfig[key]) {
          this.bodyConfig[key] = config[key];
        }
      }
    }
  }

  public init = (scene: THREE.Group, isVRM: boolean) => {
    // initialize the model to default T shape, and store the
    // default world matrix of each joint
    this.isVRM = isVRM;
    scene.traverse((node) => {
      if (node.type === this.bodyConfig.BONE) {
        // converted bone name from vrm / gltf to gltf
        let boneName = null;
        if (isVRM) {
          boneName = boneNameMapToGltf(node.name);
        } else {
          boneName = node.name;
        }

        if (boneName) {
          // overwrite node name
          node.name = boneName;

          // Matrix: current node's coordinate system under parent node's
          // coordinate system, i.e., (xp, yp, zp) * M = (xn, yn, zn), where
          // (xp, yp, zp) is the node's location in parent's coordinate system,
          // M is the matrix, and (xn, yn, zn) is the node's location in the
          // current node's coordinate system
          this.TShapeMatrixDict[boneName] = node.matrix.clone();
          // Matrix Wolrd: current node's coordinate system under world's (i.e.,
          // hip's)  coordinate system, i.e., (xw, yw, zw) * Mw = (xn, yn, zn),
          // where (xw, yw, zw) is the node's location in wolrd's coordinate
          // system, Mw is the matrix world, and (xn, yn, zn) is the node's
          // location in the current node's coordinate system
          this.TShapeMatrixWorldDict[boneName] = node.matrixWorld.clone();
          // Note: The key transformation to note is (ordering is important)
          //
          //       M_wp * M_n = M_wn,
          //
          // meaning, transformation from world to parent, then from parent to
          // the current node, is equivalent to from world to the current node.
          //
          // Note: on spine node (world), x positive points to avatar's left,
          // y positive points to avatar's up, z positive points to avatar's
          // front.

          // make the spines straight and shoulders perpendicular to the spine
          if (
            boneName === this.bodyConfig.LEFT_SHOULDER ||
            boneName === this.bodyConfig.RIGHT_SHOULDER ||
            boneName === this.bodyConfig.SPINE ||
            boneName === this.bodyConfig.SPINE_1 ||
            boneName === this.bodyConfig.SPINE_2
          ) {
            // remember the T shape matrices
            this.TShapeMatrixDict[boneName] = node.matrix.clone();
            this.TShapeMatrixWorldDict[boneName] = node.matrixWorld.clone();
          }

          // add bone to dictionary for faster access
          this.bones[boneName] = node;
        }
      }
    });
  };

  public setFullBody = (fullBodyMode: boolean) => {
    // @tong: TODO use this function to enable/disable lower body tracking
    this.isFullBody = fullBodyMode;
  };

  public applyBodyTrackResults = (prediction: any) => {
    // mediapipe prediction (after smoothing), range of each value is
    // [0, 1], relative to screen
    const rightHandLandmark = prediction.rightHandLandmarks;
    const leftHandLandmark = prediction.leftHandLandmarks;
    const poseLandmark = prediction.poseLandmarks;

    // -- apply bodytracking --
    // body rotation
    if (this.isFullBody) {
      if (
        this.bodyConfig.SPINE in this.bones &&
        this.bodyConfig.HIPS in this.bones &&
        poseLandmark
      ) {
        const spineNode = this.bones[this.bodyConfig.SPINE];
        const hipsNode = this.bones[this.bodyConfig.HIPS];

        // esitimate upperbody plane
        const hipUpLeftVector = diffVector(poseLandmark, 23, 11);
        const hipUpRightVector = diffVector(poseLandmark, 24, 12);
        const hipLeftVector = diffVector(poseLandmark, 24, 23);

        const legLeftVector = diffVector(poseLandmark, 23, 25);
        const legRightVector = diffVector(poseLandmark, 24, 26);
        const legNormalZ = new THREE.Vector3();
        legNormalZ.crossVectors(legRightVector, legLeftVector);

        legLeftVector.normalize();
        legRightVector.normalize();
        legNormalZ.normalize();

        const bodyNormalX = new THREE.Vector3();
        const bodyNormalY = new THREE.Vector3();
        const bodyNormalZ = new THREE.Vector3();
        // y is up
        bodyNormalY.addVectors(hipUpLeftVector, hipUpRightVector);
        // x is left
        bodyNormalX.copy(hipLeftVector);
        // transform to avatar world coordinate
        if (!this.isVRM) {
          bodyNormalZ.crossVectors(bodyNormalX, bodyNormalY);
          bodyNormalX.applyMatrix4(displayToAvatarWorldMatrix);
          bodyNormalY.applyMatrix4(displayToAvatarWorldMatrix);
          bodyNormalZ.applyMatrix4(displayToAvatarWorldMatrix);
          legNormalZ.applyMatrix4(displayToAvatarWorldMatrix);
        } else {
          bodyNormalX.negate();
          // z for VRM is opposite from GLTF
          legNormalZ.negate();
          bodyNormalZ.crossVectors(bodyNormalX, bodyNormalY);
          bodyNormalX.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
          bodyNormalY.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
          bodyNormalZ.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
          legNormalZ.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
        }

        bodyNormalX.normalize();
        bodyNormalY.normalize();
        bodyNormalZ.normalize();
        legNormalZ.normalize();

        // rotate hips(full body) left and right, only if we see up leg
        const hipsQt = new THREE.Quaternion();
        const hipsDesiredEulerAngle = new THREE.Euler();
        hipsQt.setFromUnitVectors(new THREE.Vector3(0, 0, 1), legNormalZ);
        hipsDesiredEulerAngle.setFromQuaternion(hipsQt, this.bodyConfig.XZY);
        if (poseLandmark[25].y > 1 || poseLandmark[26].y > 1) {
          // either leg has y larger than the screen max y
          hipsDesiredEulerAngle.y = 0;
        }
        hipsDesiredEulerAngle.x = 0;
        hipsDesiredEulerAngle.z = 0;
        hipsQt.setFromEuler(hipsDesiredEulerAngle);
        // rotate hips(full body) left and right if up leg is not parallel to the ground (GTLF ONLY)
        if (
          Math.abs(legLeftVector.y) > 0.4 &&
          Math.abs(legRightVector.y) > 0.4
        ) {
          if (!this.isVRM) {
            applyQt(hipsNode, hipsQt);
          }
        }

        const hipsToSpineCoordinateTransform = new THREE.Matrix4();
        hipsToSpineCoordinateTransform.set(
          bodyNormalX.x,
          bodyNormalY.x,
          bodyNormalZ.x,
          0,
          bodyNormalX.y,
          bodyNormalY.y,
          bodyNormalZ.y,
          0,
          bodyNormalX.z,
          bodyNormalY.z,
          bodyNormalZ.z,
          0,
          0,
          0,
          0,
          1
        );

        const hipsTospineLocal = new THREE.Matrix4();
        const spineQt = new THREE.Quaternion();
        const hipsMatrixWorld = hipsNode.matrixWorld.clone();
        // same as above, since M_wp * M_n = M_wn, thus M_n = M_wp ^ (-1) * M_wn
        hipsMatrixWorld.invert();
        hipsTospineLocal.multiplyMatrices(
          hipsMatrixWorld,
          hipsToSpineCoordinateTransform
        );
        spineQt.setFromRotationMatrix(hipsTospineLocal);
        const spineDesiredEulerAngle = new THREE.Euler();
        spineDesiredEulerAngle.setFromQuaternion(spineQt, this.bodyConfig.XZY);
        applyQt(spineNode, spineQt);
      }

      // left Up leg
      if (this.bodyConfig.LEFT_UP_LEG in this.bones && poseLandmark) {
        let displayParentVector = null;
        const node = this.bones[this.bodyConfig.LEFT_UP_LEG];
        if (!this.isVRM) {
          displayParentVector = new THREE.Vector3(0, -1, 0);
        } else {
          displayParentVector = new THREE.Vector3(0, 1, 0);
        }
        const displayChildVector = diffVector(poseLandmark, 23, 25);
        applyRotationFromVectorDiffUpLeg(
          node,
          displayParentVector,
          displayChildVector,
          this.isVRM
        );
      }

      if (this.bodyConfig.LEFT_LEG in this.bones && poseLandmark) {
        const node = this.bones[this.bodyConfig.LEFT_LEG];
        const displayParentVector = diffVector(poseLandmark, 23, 25);
        const displayChildVector = diffVector(poseLandmark, 25, 27);
        applyRotationFromVectorDiffLeg(
          node,
          displayParentVector,
          displayChildVector,
          this.isVRM
        );
      }

      if (this.bodyConfig.RIGHT_UP_LEG in this.bones && poseLandmark) {
        let displayParentVector = null;
        const node = this.bones[this.bodyConfig.RIGHT_UP_LEG];
        if (!this.isVRM) {
          displayParentVector = new THREE.Vector3(0, -1, 0);
        } else {
          displayParentVector = new THREE.Vector3(0, 1, 0);
        }
        const displayChildVector = diffVector(poseLandmark, 24, 26);
        applyRotationFromVectorDiffUpLeg(
          node,
          displayParentVector,
          displayChildVector,
          this.isVRM
        );
      }
      if (this.bodyConfig.RIGHT_LEG in this.bones && poseLandmark) {
        const node = this.bones[this.bodyConfig.RIGHT_LEG];
        const displayParentVector = diffVector(poseLandmark, 24, 26);
        const displayChildVector = diffVector(poseLandmark, 26, 28);
        applyRotationFromVectorDiffLeg(
          node,
          displayParentVector,
          displayChildVector,
          this.isVRM
        );
      }
    }

    // left arm
    if (this.bodyConfig.LEFT_ARM in this.bones && poseLandmark) {
      let displayParentVector = null;
      const node = this.bones[this.bodyConfig.LEFT_ARM];
      if (this.isFullBody) {
        displayParentVector = diffVector(poseLandmark, 12, 11);
      } else {
        displayParentVector = new THREE.Vector3(1, 0, 0);
      }
      const displayChildVector = diffVector(poseLandmark, 11, 13);
      applyRotationFromVectorDiff(
        node,
        displayParentVector,
        displayChildVector,
        this.isVRM
      );
    }

    // left forearm
    if (this.bodyConfig.LEFT_FORE_ARM in this.bones && poseLandmark) {
      const node = this.bones[this.bodyConfig.LEFT_FORE_ARM];
      const displayParentVector = diffVector(poseLandmark, 11, 13);
      const displayChildVector = diffVector(poseLandmark, 13, 15);
      applyRotationFromVectorDiff(
        node,
        displayParentVector,
        displayChildVector,
        this.isVRM
      );
    }

    // right arm
    if (this.bodyConfig.RIGHT_ARM in this.bones && poseLandmark) {
      let displayParentVector = null;
      const node = this.bones[this.bodyConfig.RIGHT_ARM];
      if (this.isFullBody) {
        displayParentVector = diffVector(poseLandmark, 11, 12);
      } else {
        displayParentVector = new THREE.Vector3(-1, 0, 0);
      }
      const displayChildVector = diffVector(poseLandmark, 12, 14);
      applyRotationFromVectorDiff(
        node,
        displayParentVector,
        displayChildVector,
        this.isVRM
      );
    }

    // right forearm
    if (this.bodyConfig.RIGHT_FORE_ARM in this.bones && poseLandmark) {
      const node = this.bones[this.bodyConfig.RIGHT_FORE_ARM];
      const displayParentVector = diffVector(poseLandmark, 12, 14);
      const displayChildVector = diffVector(poseLandmark, 14, 16);
      applyRotationFromVectorDiff(
        node,
        displayParentVector,
        displayChildVector,
        this.isVRM
      );
    }
    // left hand
    const leftPalmNormalY = new THREE.Vector3(); // cache for finger use
    if (this.bodyConfig.LEFT_HAND in this.bones) {
      if (leftHandLandmark) {
        const palmNormalX = new THREE.Vector3();
        const palmNormalY = new THREE.Vector3();
        const palmNormalZ = new THREE.Vector3();
        // find the normal vector of palm (display coordinate)
        // finger vector (from wrist to each finger first joint)
        const indexFingerVector = diffVector(leftHandLandmark, 0, 5);
        const middleFingerVector = diffVector(leftHandLandmark, 0, 9);
        const ringFingerVector = diffVector(leftHandLandmark, 0, 13);
        const pinkyFingerVector = diffVector(leftHandLandmark, 0, 17);
        if (!this.isVRM) {
          // y is along the average of index, middle, ring and pinky finger
          palmNormalY.addVectors(indexFingerVector, pinkyFingerVector);
          palmNormalY.addVectors(palmNormalY, middleFingerVector);
          palmNormalY.addVectors(palmNormalY, ringFingerVector);
          leftPalmNormalY.copy(palmNormalY.clone()); // for finger use later
          // z is point outward from the plam
          palmNormalZ.crossVectors(pinkyFingerVector, indexFingerVector);
          // x is from index to pinky finger (left hand only)
          palmNormalX.crossVectors(palmNormalY, palmNormalZ);
          // transform to avatar world coordinate
          palmNormalX.applyMatrix4(displayToAvatarWorldMatrix);
          palmNormalY.applyMatrix4(displayToAvatarWorldMatrix);
          palmNormalZ.applyMatrix4(displayToAvatarWorldMatrix);
        } else {
          // x is along the inverse average of index, middle, ring and pinky finger
          palmNormalX.addVectors(indexFingerVector, pinkyFingerVector);
          palmNormalX.addVectors(palmNormalX, middleFingerVector);
          palmNormalX.addVectors(palmNormalX, ringFingerVector);
          leftPalmNormalY.copy(palmNormalX.clone()); // for finger use later
          palmNormalX.negate();
          // y is point inward from the plam
          palmNormalY.crossVectors(indexFingerVector, pinkyFingerVector);
          // z is from pinky to index finger (left hand only)
          palmNormalZ.crossVectors(palmNormalX, palmNormalY);
          // transform to avatar world coordinate
          palmNormalX.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
          palmNormalY.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
          palmNormalZ.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
        }
        // normalize to become rotation matrix
        palmNormalX.normalize();
        palmNormalY.normalize();
        palmNormalZ.normalize();
        // rotate forearm and hand
        rotateHandAndForearm(
          palmNormalX,
          palmNormalY,
          palmNormalZ,
          this.bones[this.bodyConfig.LEFT_HAND],
          this.isVRM
        );
      } else {
        // missing hand dection, revert to default position
        // x: 0, y: 0, z: 0, w: 1
        const qt = new THREE.Quaternion(0, 0, 0, 1);
        applyQt(this.bones[this.bodyConfig.LEFT_HAND], qt);
      }
    }

    // right hand
    const rightPalmNormalY = new THREE.Vector3(); // cache for finger user
    if (this.bodyConfig.RIGHT_HAND in this.bones) {
      if (rightHandLandmark) {
        const palmNormalX = new THREE.Vector3();
        const palmNormalY = new THREE.Vector3();
        const palmNormalZ = new THREE.Vector3();
        // find the normal vector of palm (display coordinate)
        // finger vector (from wrist to each finger first joint)
        const indexFingerVector = diffVector(rightHandLandmark, 0, 5);
        const middleFingerVector = diffVector(rightHandLandmark, 0, 9);
        const ringFingerVector = diffVector(rightHandLandmark, 0, 13);
        const pinkyFingerVector = diffVector(rightHandLandmark, 0, 17);
        if (!this.isVRM) {
          // y is along the average of index, middle, ring and pinky finger
          palmNormalY.addVectors(indexFingerVector, pinkyFingerVector);
          palmNormalY.addVectors(palmNormalY, middleFingerVector);
          palmNormalY.addVectors(palmNormalY, ringFingerVector);
          rightPalmNormalY.copy(palmNormalY.clone()); // for finger use later
          // z is point outward from the plam
          palmNormalZ.crossVectors(indexFingerVector, pinkyFingerVector);
          // x is from pinky to index finger (right hand only)
          palmNormalX.crossVectors(palmNormalY, palmNormalZ);
          // transform to avatar world coordinate
          palmNormalX.applyMatrix4(displayToAvatarWorldMatrix);
          palmNormalY.applyMatrix4(displayToAvatarWorldMatrix);
          palmNormalZ.applyMatrix4(displayToAvatarWorldMatrix);
        } else {
          palmNormalX.addVectors(indexFingerVector, pinkyFingerVector);
          palmNormalX.addVectors(palmNormalX, middleFingerVector);
          palmNormalX.addVectors(palmNormalX, ringFingerVector);
          rightPalmNormalY.copy(palmNormalX.clone()); // for finger use later
          // z is point outward from the plam
          palmNormalY.crossVectors(pinkyFingerVector, indexFingerVector);
          // x is from index to pinky finger (left hand only)
          palmNormalZ.crossVectors(palmNormalX, palmNormalY);
          // transform to avatar world coordinate
          palmNormalX.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
          palmNormalY.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
          palmNormalZ.applyMatrix4(vrmDisplayToAvatarWorldMatrix);
        }
        // normalize to become rotation matrix
        palmNormalX.normalize();
        palmNormalY.normalize();
        palmNormalZ.normalize();
        // rotate forearm and hand
        rotateHandAndForearm(
          palmNormalX,
          palmNormalY,
          palmNormalZ,
          this.bones[this.bodyConfig.RIGHT_HAND],
          this.isVRM
        );
      } else {
        // missing hand dection, revert to default position
        // x: 0, y: 0, z: 0, w: 1
        const qt = new THREE.Quaternion(0, 0, 0, 1);
        applyQt(this.bones[this.bodyConfig.RIGHT_HAND], qt);
      }
    }

    // left thumb
    if (
      this.bodyConfig.LEFT_THUMB_1 in this.bones &&
      this.bodyConfig.LEFT_THUMB_2 in this.bones &&
      this.bodyConfig.LEFT_THUMB_3 in this.bones
    ) {
      rotateThumb(
        leftHandLandmark,
        leftPalmNormalY,
        this.bones[this.bodyConfig.LEFT_THUMB_1],
        this.bones[this.bodyConfig.LEFT_THUMB_2],
        this.bones[this.bodyConfig.LEFT_THUMB_3],
        0,
        2,
        3,
        4,
        this.TShapeMatrixDict,
        this.isVRM
      );
    }

    // right thumb
    if (
      this.bodyConfig.RIGHT_THUMB_1 in this.bones &&
      this.bodyConfig.RIGHT_THUMB_2 in this.bones &&
      this.bodyConfig.RIGHT_THUMB_3 in this.bones
    ) {
      rotateThumb(
        rightHandLandmark,
        rightPalmNormalY,
        this.bones[this.bodyConfig.RIGHT_THUMB_1],
        this.bones[this.bodyConfig.RIGHT_THUMB_2],
        this.bones[this.bodyConfig.RIGHT_THUMB_3],
        0,
        2,
        3,
        4,
        this.TShapeMatrixDict,
        this.isVRM
      );
    }

    // left index finger
    if (
      this.bodyConfig.LEFT_INDEX_1 in this.bones &&
      this.bodyConfig.LEFT_INDEX_2 in this.bones &&
      this.bodyConfig.LEFT_INDEX_3 in this.bones
    ) {
      rotateFingers(
        leftHandLandmark,
        leftPalmNormalY,
        this.bones[this.bodyConfig.LEFT_INDEX_1],
        this.bones[this.bodyConfig.LEFT_INDEX_2],
        this.bones[this.bodyConfig.LEFT_INDEX_3],
        5,
        6,
        7,
        8,
        this.TShapeMatrixDict,
        this.isVRM,
        false
      );
    }

    // right index finger
    if (
      this.bodyConfig.RIGHT_INDEX_1 in this.bones &&
      this.bodyConfig.RIGHT_INDEX_2 in this.bones &&
      this.bodyConfig.RIGHT_INDEX_3 in this.bones
    ) {
      rotateFingers(
        rightHandLandmark,
        rightPalmNormalY,
        this.bones[this.bodyConfig.RIGHT_INDEX_1],
        this.bones[this.bodyConfig.RIGHT_INDEX_2],
        this.bones[this.bodyConfig.RIGHT_INDEX_3],
        5,
        6,
        7,
        8,
        this.TShapeMatrixDict,
        this.isVRM,
        true
      );
    }

    // left middle finger
    if (
      this.bodyConfig.LEFT_MIDDLE_1 in this.bones &&
      this.bodyConfig.LEFT_MIDDLE_2 in this.bones &&
      this.bodyConfig.LEFT_MIDDLE_3 in this.bones
    ) {
      rotateFingers(
        leftHandLandmark,
        leftPalmNormalY,
        this.bones[this.bodyConfig.LEFT_MIDDLE_1],
        this.bones[this.bodyConfig.LEFT_MIDDLE_2],
        this.bones[this.bodyConfig.LEFT_MIDDLE_3],
        9,
        10,
        11,
        12,
        this.TShapeMatrixDict,
        this.isVRM,
        false
      );
    }

    // right middle finger
    if (
      this.bodyConfig.RIGHT_MIDDLE_1 in this.bones &&
      this.bodyConfig.RIGHT_MIDDLE_2 in this.bones &&
      this.bodyConfig.RIGHT_MIDDLE_3 in this.bones
    ) {
      rotateFingers(
        rightHandLandmark,
        rightPalmNormalY,
        this.bones[this.bodyConfig.RIGHT_MIDDLE_1],
        this.bones[this.bodyConfig.RIGHT_MIDDLE_2],
        this.bones[this.bodyConfig.RIGHT_MIDDLE_3],
        9,
        10,
        11,
        12,
        this.TShapeMatrixDict,
        this.isVRM,
        true
      );
    }

    // left ring finger
    if (
      this.bodyConfig.LEFT_RING_1 in this.bones &&
      this.bodyConfig.LEFT_RING_2 in this.bones &&
      this.bodyConfig.LEFT_RING_3 in this.bones
    ) {
      rotateFingers(
        leftHandLandmark,
        leftPalmNormalY,
        this.bones[this.bodyConfig.LEFT_RING_1],
        this.bones[this.bodyConfig.LEFT_RING_2],
        this.bones[this.bodyConfig.LEFT_RING_3],
        13,
        14,
        15,
        16,
        this.TShapeMatrixDict,
        this.isVRM,
        false
      );
    }

    // right ring finger
    if (
      this.bodyConfig.RIGHT_RING_1 in this.bones &&
      this.bodyConfig.RIGHT_RING_2 in this.bones &&
      this.bodyConfig.RIGHT_RING_3 in this.bones
    ) {
      rotateFingers(
        rightHandLandmark,
        rightPalmNormalY,
        this.bones[this.bodyConfig.RIGHT_RING_1],
        this.bones[this.bodyConfig.RIGHT_RING_2],
        this.bones[this.bodyConfig.RIGHT_RING_3],
        13,
        14,
        15,
        16,
        this.TShapeMatrixDict,
        this.isVRM,
        true
      );
    }

    // left pinky finger
    if (
      this.bodyConfig.LEFT_PINKY_1 in this.bones &&
      this.bodyConfig.LEFT_PINKY_2 in this.bones &&
      this.bodyConfig.LEFT_PINKY_3 in this.bones
    ) {
      rotateFingers(
        leftHandLandmark,
        leftPalmNormalY,
        this.bones[this.bodyConfig.LEFT_PINKY_1],
        this.bones[this.bodyConfig.LEFT_PINKY_2],
        this.bones[this.bodyConfig.LEFT_PINKY_3],
        17,
        18,
        19,
        20,
        this.TShapeMatrixDict,
        this.isVRM,
        false
      );
    }

    // right pinky finger
    if (
      this.bodyConfig.RIGHT_PINKY_1 in this.bones &&
      this.bodyConfig.RIGHT_PINKY_2 in this.bones &&
      this.bodyConfig.RIGHT_PINKY_3 in this.bones
    ) {
      rotateFingers(
        rightHandLandmark,
        rightPalmNormalY,
        this.bones[this.bodyConfig.RIGHT_PINKY_1],
        this.bones[this.bodyConfig.RIGHT_PINKY_2],
        this.bones[this.bodyConfig.RIGHT_PINKY_3],
        17,
        18,
        19,
        20,
        this.TShapeMatrixDict,
        this.isVRM,
        true
      );
    }
  };
}
