import * as THREE from 'three';
import { Euler } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AvatarModel } from './avatarModel';
import {
  appleFaceDictionaryTransform,
  extractAppleMorphTargetDictionary,
  faceRotationToBlendshapes,
  checkUnflipped,
  flipBlendShapes,
  rangeTransform,
  undefTo0,
} from './faceUtils';
import {
  BoneCache,
  BreathingMotor
} from '../../../plugins/studio/src/utils/faceUtils';

const GLTF_DEFAULT_CAMERA_Z = 1;
const GLTF_OFFSET_FACTOR_Y = 1.8;
const GLTF_DEFAULT_ARM_ROTATION = 1.45;
const FACE_MOVE_MULTIPLIER = 0.5;
const FACE_DEPTH_MULTIPLIER = 2;
const NECK = 'Neck';
const LEFTEYE = 'LeftEye';
const RIGHTEYE = 'RightEye';
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
    for (const [morphTargetName, morphTargetIndex] of Object.entries(morphTargetIndices)) {
      if (!(morphTargetName in this.availableMorphTargets)) {
        // new blend shape name, add it to global caache
        this.availableMorphTargets[morphTargetName] = [];
      }
      // add this component to the list of components that contain this
      // blendshape name
      this.availableMorphTargets[morphTargetName].push(this.morphTargets.length - 1);
    }
  };

  public applyMorphTargetValue = (morphTargetName: string, morphTargetValue: number) => {
    if (morphTargetName in this.availableMorphTargets) {
      // only go through the components that contain this blendshape name
      for (const i in this.availableMorphTargets[morphTargetName]) {
        const morphTargetValueTransform = rangeTransform(0, 1, 0, 1, morphTargetValue);
        this.morphTargets[i][this.morphTargetsIndices[i][morphTargetName]] = morphTargetValueTransform;
      }
    }
  };
}

export default class GLTFModel extends AvatarModel {
  private scene: THREE.Scene;
  private loader: GLTFLoader;
  private pivot: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private morphTargetCache: MorphTargetCache;
  private boneCache: BoneCache;
  private canvasCtx: CanvasRenderingContext2D;
  private canvasInvisible: boolean;
  private neckRotationAssistX: number;
  private neckRotationAssistY: number;
  private neckRotationAssistZ: number;
  private lipSyncJawOpen: number;
  private avatarModel: THREE.Group | null;
  private positionDefaultX: number = 0;
  private positionDefaultY: number = 0;
  private positionDefaultZ: number = 0;
  private userPlacementX: number = 0;
  private userPlacementY: number = 0;
  private userPlacementZ: number = 0;
  private faceTrackingX: number = 0;
  private faceTrackingY: number = 0;
  private faceTrackingZ: number = 0;
  private breathing: boolean = true;
  private breathingMotor: BreathingMotor;
  private neckRotationOrder: string[] = ['X', 'Y', 'Z'];

  constructor(config: string) {
    super('GLTFModel');

    // generate canvas element
    this.canvas = document.getElementById('gltf-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.setAttribute('id', 'gltf-canvas');
      // Note: initially set display style none to hide the canvas, otherwise
      // it will somehow block the google meet top banner
      this.canvas.setAttribute('style', 'display: none');
      document.documentElement.appendChild(this.canvas);
    }
    this.canvasCtx = this.canvas.getContext('2d')!;
    this.canvasInvisible = true;

    // initialize three rendering environment
    this.scene = new THREE.Scene();
    this.loader = new GLTFLoader();
    this.avatarModel = null;
    this.pivot = new THREE.Group();
    this.camera = new THREE.PerspectiveCamera(
      45, 1280 / 720, 0.1, 1000
    );

    this.camera.position.set(0, 0, GLTF_DEFAULT_CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(1280, 720);

    // this will make the scene much brighter
    this.renderer.outputEncoding = THREE.sRGBEncoding

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 300, 0);
    this.scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(75, 300, -75);
    this.scene.add(dirLight);

    // morph targets to deform
    this.morphTargetCache = new MorphTargetCache();

    // bone targets to move
    this.boneCache = new BoneCache();

    // rotation assistance
    this.neckRotationAssistX = 0;
    this.neckRotationAssistY = 0;
    this.neckRotationAssistZ = 0;

    // initialize breathing motor
    this.breathingMotor = new BreathingMotor();

    // lipsync value
    this.lipSyncJawOpen = 0;

    if (config) {
      this.loadConfig(config);
    }
  }

  private animateBreathingMotion = () => {
    const spineAngleDiffX = this.breathingMotor.getSinOffset(800, false);
    const neckAngleDiffX = this.breathingMotor.getSinOffset(800, false);
    const neckAngleDiffY = this.breathingMotor.getSinOffset(1600, true);
    this.boneCache.additiveRotateNode('Spine', 0.04 * spineAngleDiffX, 0, 0);
    this.boneCache.additiveRotateNode('Neck', 0.06 * neckAngleDiffX, 0.03 * neckAngleDiffY, 0);
  };

  // Load file asynchronously
  public async loadFile(path: string) {
    try {
      const gltf = await this.loader.loadAsync(path);
      this.avatarModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(this.avatarModel);

      //Rescale the object to normalized space
      const size = box.getSize(new THREE.Vector3());
      var maxAxis = Math.max(size.x, size.y, size.z);
      this.avatarModel.scale.multiplyScalar(0.8 / maxAxis);

      const center = box.getCenter(new THREE.Vector3());
      box.setFromObject(this.avatarModel);
      box.getCenter(center);
      box.getSize(size);
      this.avatarModel.position.x += (this.avatarModel.position.x - center.x);
      this.avatarModel.position.y += (this.avatarModel.position.y - center.y) * GLTF_OFFSET_FACTOR_Y;
      this.avatarModel.position.z += (this.avatarModel.position.z - center.z);
      this.positionDefaultX = this.avatarModel.position.x;
      this.positionDefaultY = this.avatarModel.position.y;
      this.positionDefaultZ = this.avatarModel.position.z;
      this.userPlacementX = this.positionDefaultX;
      this.userPlacementY = this.positionDefaultY;
      this.userPlacementZ = this.positionDefaultZ;

      this.scene.add(this.avatarModel);
      this.scene.add(this.pivot);
      this.pivot.add(this.avatarModel);

      this.avatarModel.traverse((node) => {
        const meshNode = <THREE.Mesh>node;
        if (meshNode.isMesh && meshNode.morphTargetInfluences) {
          const alterMorphTargetDict = appleFaceDictionaryTransform(
            extractAppleMorphTargetDictionary(meshNode.morphTargetDictionary));
          this.morphTargetCache.addMorphTarget(
            meshNode.morphTargetInfluences, alterMorphTargetDict);
        }
        const boneNode = <THREE.Bone>node;
        if (boneNode.isBone) {
          this.boneCache.addBone(boneNode);
        }
      });

      // glTF model ready at this point
      this.modelReady = true;
    } catch (e) {
      console.error(e);
    }
  }

  public loadConfig(config: any) {
    // adjust camera position
    if (config.camera) {
      let x = config.camera.lookX ? config.camera.lookX : 0;
      let y = config.camera.lookY ? config.camera.lookY : 0;
      let z = config.camera.lookZ ? config.camera.lookZ : 0;
      this.camera.lookAt(x, y, z);
    }
    if (config.rotation?.body) {
      const bodyRotationAssistX = config.rotation.body.x
        ? config.rotation.body.x
        : 0;
      const bodyRotationAssistY = config.rotation.body.y
        ? config.rotation.body.y
        : 0;
      const bodyRotationAssistZ = config.rotation.body.z
        ? config.rotation.body.z
        : 0;
      this.pivot.rotation.x = bodyRotationAssistX;
      this.pivot.rotation.y = bodyRotationAssistY;
      this.pivot.rotation.z = bodyRotationAssistZ;
    }
    if (config.rotation?.neck) {
      console.log('config', config.rotation.neck.x)
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
    this.lipSyncJawOpen = volume;
  };

  public updateFrame(prediction: any) {
    if (prediction) {
      // facial expressions
      let blendshapes = prediction.blendshapes;
      if (checkUnflipped()) {
        blendshapes = flipBlendShapes(blendshapes);
      }
      for (const [alterMorphTargetName, alterMorphTargetValue] of blendshapes) {
        this.morphTargetCache.applyMorphTargetValue(
          alterMorphTargetName, alterMorphTargetValue);
      }

      // face rotation
      const rotationBlendshapes = faceRotationToBlendshapes(prediction.rotationQuaternion);
      const neckRotateX = rotationBlendshapes['headPitch'] + this.neckRotationAssistX;
      const neckRotateY = rotationBlendshapes['headYaw'] + this.neckRotationAssistY;
      const neckRotateZ = rotationBlendshapes['headRoll'] + this.neckRotationAssistZ;
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

      // body position
      if (this.avatarModel) {
        if (this.freeMove) {
          this.faceTrackingX = -(prediction.normalizedImagePosition.x - 0.5) * FACE_MOVE_MULTIPLIER;
          this.faceTrackingY = (prediction.normalizedImagePosition.y - 0.5) * FACE_MOVE_MULTIPLIER;
          this.faceTrackingZ = prediction.normalizedImageScale * FACE_DEPTH_MULTIPLIER;
        }
        this.avatarModel.position.x = this.userPlacementX;
        this.avatarModel.position.y = this.userPlacementY;
        this.avatarModel.position.z = this.userPlacementZ;
      }

      // convert blendshapes back to dictionary for faster lookup
      blendshapes = Object.fromEntries(prediction.blendshapes);

      // apply lipsync
      const lipSyncedJapOpen = Math.min(1, undefTo0(blendshapes['jawOpen'] + this.lipSyncJawOpen));
      this.morphTargetCache.applyMorphTargetValue('jawOpen', lipSyncedJapOpen);

      // when the landmark prediction is available, make canvas element visible
      // in order to show the 3d model
      if (this.canvasInvisible) {
        this.canvasInvisible = false;
        this.canvas?.setAttribute('style', 'display: block');
      }
    }

    // automatic breathing motion
    if (this.breathing) {
      this.animateBreathingMotion();
    }

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // right after the rendering step, draw image on intermedia canvas
    if (this.canvas) {
      this.canvas.width = Math.min(window.innerWidth, 1920);;
      this.canvas.height = Math.round(this.canvas.width * 9 / 16);;
      this.canvasCtx.drawImage(
        this.renderer.domElement, 0, 0, this.canvas.width, this.canvas.height
      );
    }
  }

  public lookAt(x: number, y: number, z: number) {
    this.pivot.rotation.x = x;
    this.pivot.rotation.y = y;
    if (z) this.pivot.rotation.z = z;
  }

  public display(
    outCanvas: HTMLCanvasElement,
    outCanvasCtx: CanvasRenderingContext2D
  ) {
    if (this.canvas) {
      outCanvasCtx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public manualRender = () => {
    // No need to do anything because updateFrame contains the
    // rendering function already
  };

  public setModelPlacement = (x: number, y: number) => {
    if (this.avatarModel) {
      this.userPlacementX = this.positionDefaultX + (x - 0.5);
      this.userPlacementY = this.positionDefaultY - (y - 0.5);
    }
  };

  public setSizeFactor = (factor: number) => {
    if (this.avatarModel) {
      this.userPlacementZ = this.positionDefaultZ + (factor - 1);
    }
  };
}
