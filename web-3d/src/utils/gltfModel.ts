import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AvatarModel, Size } from '@/types';
import {
  appleFaceDictionaryTransform,
  extractAppleMorphTargetDictionary,
  faceRotationToBlendshapes,
  flipBlendShapes,
  rangeTransform,
} from '@/utils/faceUtils';
import BodyTracker from '@/utils/bodyUtils';

const GLTF_OFFSET_FACTOR_Y = 1.8;
const GLTF_DEFAULT_ARM_ROTATION = 1.3;
const FACE_MOVE_MULTIPLIER = 0.5;
const NECK = 'Neck';
const LEFTARM = ['Left_arm', 'LeftArm'];
const RIGHTARM = ['Right_arm', 'RightArm'];
const SPINE = ['Spine', 'Spine1', 'Spine2']; // TODO: Generalize

/**
 * Storage class to activate the blendshapes in each avatar component. Note that
 * avatars can have multiple components (e.g., left eye lid, upper lip, etc.)
 * and each component might have different blendshapes (i.e., eye lid won't have
 * "jawOpen" blendshape), we need to find (in O(1) time) the right component and
 * activate (also in O(1) time) the right blend shape within each component.
 */
class MorphTargetCache {
  // list of list of morph targets on each object
  private morphTargets: any;

  // list of map of morph target name to index in morphTargets
  private morphTargetsIndices: any;

  // map of morph target name to object index
  private availableMorphTargets: any;

  constructor() {
    this.morphTargets = [];
    this.morphTargetsIndices = [];
    this.availableMorphTargets = {};
  }

  public addMorphTarget = (morphTargets: any, morphTargetIndices: any) => {
    // morphTargets are blend shapes of this particular component
    this.morphTargets.push(morphTargets);
    // morphTargetIndices is a map blendshape name -> index for this component
    this.morphTargetsIndices.push(morphTargetIndices);
    for (const [morphTargetName, morphTargetIndex] of Object.entries(
      morphTargetIndices
    )) {
      if (!(morphTargetName in this.availableMorphTargets)) {
        // new blend shape name, add it to global caache
        this.availableMorphTargets[morphTargetName] = [];
      }
      // add this component to the list of components that contain this
      // blendshape name
      this.availableMorphTargets[morphTargetName].push(
        this.morphTargets.length - 1
      );
    }
  };

  public applyMorphTargetValue = (
    morphTargetName: string,
    morphTargetValue: number
  ) => {
    if (morphTargetName in this.availableMorphTargets) {
      // only go through the components that contain this blendshape name
      for (const i in this.availableMorphTargets[morphTargetName]) {
        const morphTargetValueTransform = rangeTransform(
          0,
          1,
          0,
          1,
          morphTargetValue
        );
        this.morphTargets[i][this.morphTargetsIndices[i][morphTargetName]] =
          morphTargetValueTransform;
      }
    }
  };
}

/**
 * Storage class to cache the bone structure.
 */
class BoneCache {
  // map of bone name to bone node
  private avatarBones: any;
  private clothesBones: any;
  private clothesMesh: any;
  private skeleton: any;

  private initialRotation: Map<string, THREE.Euler>;

  private leftArm: string;

  private rightArm: string;

  private spine: string;

  constructor() {
    this.avatarBones = {};
    this.clothesBones = {};
    this.clothesMesh = {};
    this.initialRotation = new Map<string, THREE.Euler>();
    this.leftArm = '';
    this.rightArm = '';
    this.spine = '';
  }

  public addAvatarBone = (node: THREE.Bone) => {
    this.avatarBones[node.name] = node;
    this.initialRotation[node.name] = node.rotation.clone();

    if (LEFTARM.includes(node.name)) {
      this.leftArm = node.name;
    } else if (RIGHTARM.includes(node.name)) {
      this.rightArm = node.name;
    } else if (SPINE.includes(node.name)) {
      this.spine = node.name;
    }
  };

  public addSkeleton = (skeleton: THREE.Skeleton) => {
    this.skeleton = skeleton;
  };

  public hasSkeleton = () => {
    return this.skeleton !== undefined;
  };

  public addClothesBone = (node: THREE.Bone) => {
    this.clothesBones[node.name] = node;
  };

  public addClothesMesh = (node: THREE.Mesh) => {
    this.clothesMesh[node.name] = node;
    if (this.skeleton) {
      this.clothesMesh[node.name].skeleton = this.skeleton;
    }
  };

  public clearClothesBone = () => {
    this.clothesBones = {};
  };

  public clearClothesMesh = () => {
    this.clothesMesh = {};
  };

  public rotateNode = (
    name: string,
    rotateX: number,
    rotateY: number,
    rotateZ: number
  ): boolean => {
    if (name in this.avatarBones) {
      this.avatarBones[name].rotation.x = rotateX;
      this.avatarBones[name].rotation.y = rotateY;
      this.avatarBones[name].rotation.z = rotateZ;
      return true;
    }
    return false;
  };

  public getInitialRotation = (name: string) => {
    return this.initialRotation[name];
  };

  public getLeftArm = () => {
    return this.leftArm;
  };

  public getRightArm = () => {
    return this.rightArm;
  };

  public getSpine = () => {
    return this.spine;
  };
}

export class GLTFModel extends AvatarModel {
  private scene: THREE.Scene;

  private loader: GLTFLoader;

  private pivot: THREE.Group;

  private camera: THREE.PerspectiveCamera;

  private renderer: THREE.WebGLRenderer;

  private morphTargetCache: MorphTargetCache;

  private boneCache: BoneCache;

  private bodyTracker: BodyTracker;

  private windowResolution: Size = { width: 1280, height: 720 };

  public avatarCanvas: HTMLCanvasElement;

  private neckRotationAssistX: number;

  private neckRotationAssistY: number;

  private neckRotationAssistZ: number;

  private neckRotationOrder: string[] = ['X', 'Y', 'Z'];

  private avatarModel: THREE.Group | null;

  private threeTone: any;

  constructor(gl: THREE.WebGLRenderer, camera?: THREE.PerspectiveCamera) {
    super('GLTFModel');

    this.avatarModel = null;
    this.camera = camera;

    // Initialize three tone
    this.threeTone = new THREE.TextureLoader().load('./img/threeTone.jpeg');
    this.threeTone.minFilter = THREE.NearestFilter;
    this.threeTone.magFilter = THREE.NearestFilter;
    this.renderer = gl;

    // morph targets to deform
    this.morphTargetCache = new MorphTargetCache();

    // bone targets to move
    this.boneCache = new BoneCache();

    // rotation assistance
    this.neckRotationAssistX = 0;
    this.neckRotationAssistY = 0;
    this.neckRotationAssistZ = 0;

    // if (config) {
    //   this.loadConfig(config);
    //   this.bodyTracker = new BodyTracker(config?.bones);
    // } else {
    this.bodyTracker = new BodyTracker();
    // }
  }

  // Load file asynchronously
  public async loadFile(scene: THREE.Group) {
    try {
      // const gltf = await this.loader.loadAsync(path);
      // this.avatarModel = gltf.scene;
      // this.scene = scene;

      this.avatarModel = scene;
      this.pivot = scene;

      this.avatarModel.traverse((node) => {
        const meshNode = <THREE.Mesh>node;
        if (meshNode.isMesh && meshNode.morphTargetInfluences) {
          const alterMorphTargetDict = appleFaceDictionaryTransform(
            extractAppleMorphTargetDictionary(meshNode.morphTargetDictionary)
          );
          this.morphTargetCache.addMorphTarget(
            meshNode.morphTargetInfluences,
            alterMorphTargetDict
          );

          // Add skeleton
          if (!this.boneCache.hasSkeleton()) {
            this.boneCache.addSkeleton((meshNode as any).skeleton);
          }
        }
        const boneNode = <THREE.Bone>node;
        if (boneNode.isBone) {
          this.boneCache.addAvatarBone(boneNode);
        }

        // Apply cel shading
        if ((node as any).material) {
          const oldMat = (node as any).material;
          const toonMat = new THREE.MeshToonMaterial({
            color: '#ffffff',
            gradientMap: this.threeTone,
          });
          toonMat.map = oldMat.map;
          (node as any).material = toonMat;
        }
      });

      // Put down model arms
      const leftArm = this.boneCache.getLeftArm();
      const rightArm = this.boneCache.getRightArm();
      if (leftArm && rightArm) {
        this.boneCache.rotateNode(leftArm, 0, 0, GLTF_DEFAULT_ARM_ROTATION);
        this.boneCache.rotateNode(rightArm, 0, 0, -GLTF_DEFAULT_ARM_ROTATION);
      }

      // initialize body tracking model
      this.bodyTracker.init(this.avatarModel, false);
    } catch (e) {
      console.error(e);
    }
  }

  public loadClothes(scene: any) {
    if (!scene) return;

    scene.traverse((node) => {
      // Add clothes bone
      if (node.isBone) {
        this.boneCache.addClothesBone(node);
      }

      // Add clothes mesh
      if (node.isMesh) {
        this.boneCache.addClothesMesh(node);
      }

      // apply cel shading
      if (node.material) {
        const oldMat = node.material;
        const toonMat = new THREE.MeshToonMaterial({
          color: '#ffffff',
          gradientMap: this.threeTone,
        });
        toonMat.map = oldMat.map;
        node.material = toonMat;
      }
    });
  }

  public loadConfig(config: any) {
    // adjust camera position
    if (config.camera) {
      const px = config.camera.posX ? config.camera.posX : 0;
      const py = config.camera.posY ? config.camera.posY : 0;
      const pz = config.camera.posZ ? config.camera.posZ : 1;
      this.camera.position?.set(px, py, pz);
      const lx = config.camera.lookX ? config.camera.lookX : 0;
      const ly = config.camera.lookY ? config.camera.lookY : 0;
      const lz = config.camera.lookZ ? config.camera.lookZ : 0;
      this.camera.lookAt(lx, ly, lz);
    }
    if (config.rotation?.body) {
      const bodyneckRotationAssistX = config.rotation.body.x
        ? config.rotation.body.x
        : 0;
      const bodyneckRotationAssistY = config.rotation.body.y
        ? config.rotation.body.y
        : 0;
      const bodyneckRotationAssistZ = config.rotation.body.z
        ? config.rotation.body.z
        : 0;
      this.pivot.rotation.x = bodyneckRotationAssistX;
      this.pivot.rotation.y = bodyneckRotationAssistY;
      this.pivot.rotation.z = bodyneckRotationAssistZ;
    }
    if (config.rotation?.neck) {
      this.neckRotationAssistX = config.rotation.neck.x
        ? config.rotation.neck.x
        : 0;
      this.neckRotationAssistY = config.rotation.neck.y
        ? config.rotation.neck.y
        : 0;
      this.neckRotationAssistZ = config.rotation.neck.z
        ? config.rotation.neck.z
        : 0;
    }
    if (config.blendshapes?.neck?.order) {
      this.neckRotationOrder = config.blendshapes?.neck?.order;
    }
  }

  public updateLipSync = (volume: number) => {
    // TODO: perform lip sync
  };

  public updateFrame(facePrediction: any, bodyPrediction: any) {
    if (facePrediction) {
      const blendshapes: any = flipBlendShapes(facePrediction.blendshapes);
      // facial expressions
      for (const [alterMorphTargetName, alterMorphTargetValue] of blendshapes) {
        this.morphTargetCache.applyMorphTargetValue(
          alterMorphTargetName,
          alterMorphTargetValue
        );
      }

      const rotationBlendshapes = faceRotationToBlendshapes(
        facePrediction.rotationQuaternion
      );
      const neckRotateX =
        rotationBlendshapes['headPitch'] + this.neckRotationAssistX;
      const neckRotateY =
        -rotationBlendshapes['headYaw'] + this.neckRotationAssistY;
      const neckRotateZ =
        -rotationBlendshapes['headRoll'] + this.neckRotationAssistZ;

      // Pass neck rotation in the default xyz or custom order
      const neckRotateCoordinates: number[] = [];
      for (const axis of this.neckRotationOrder) {
        switch (axis) {
          case 'X':
            neckRotateCoordinates.push(neckRotateX);
            break;
          case '-X':
            neckRotateCoordinates.push(-neckRotateX);
            break;
          case 'Y':
            neckRotateCoordinates.push(neckRotateY);
            break;
          case '-Y':
            neckRotateCoordinates.push(-neckRotateY);
            break;
          case 'Z':
            neckRotateCoordinates.push(neckRotateZ);
            break;
          case '-Z':
            neckRotateCoordinates.push(-neckRotateZ);
            break;
          default:
            break;
        }
      }
      const neckRotated = this.boneCache.rotateNode(
        NECK,
        neckRotateCoordinates[0],
        neckRotateCoordinates[1],
        neckRotateCoordinates[2]
      );

      if (!neckRotated) {
        // if the neck node rotation isn't available, rotate the whole body
        this.pivot.rotation.x = neckRotateX;
        this.pivot.rotation.y = neckRotateY;
        this.pivot.rotation.z = neckRotateZ;
      }

      const spine = this.boneCache.getSpine();
      if (spine) {
        const defaultSpineRotation: THREE.Euler =
          this.boneCache.getInitialRotation(spine);
        const faceTrackingX =
          -(facePrediction.normalizedImagePosition.x - 0.5) *
          FACE_MOVE_MULTIPLIER;
        this.boneCache.rotateNode(
          spine,
          defaultSpineRotation.x - faceTrackingX,
          defaultSpineRotation.y,
          defaultSpineRotation.z - faceTrackingX
        );
      }
    }

    if (bodyPrediction) {
      this.bodyTracker.applyBodyTrackResults(bodyPrediction);
    }
  }

  public lookAt(x: number, y: number, z: number) {
    this.pivot.rotation.x = x;
    this.pivot.rotation.y = y;
    if (z) this.pivot.rotation.z = z;
  }

  public display(canvasSize: Size, outCanvasCtx: CanvasRenderingContext2D) {
    if (this.avatarCanvas) {
      outCanvasCtx.drawImage(
        this.avatarCanvas,
        0,
        0,
        this.windowResolution.width,
        this.windowResolution.height
      );
    }
  }

  public setModelPlacement = (x: number, y: number) => {};

  public setSizeFactor = (factor: number) => {};
}
