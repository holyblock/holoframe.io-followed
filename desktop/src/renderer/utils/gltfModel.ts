import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AvatarModel, Size } from '../types';
import {
  appleFaceDictionaryTransform,
  extractAppleMorphTargetDictionary,
  faceRotationToBlendshapes,
  flipBlendShapes,
  rangeTransform,
} from './faceUtils';
import {
  BoneCache,
  BreathingMotor
} from '../../../../plugins/studio/src/utils/faceUtils';
import BodyTracker from './bodyUtils';

const FACE_MOVE_MULTIPLIER = 1.5;
const FACE_DEPTH_MULTIPLIER = 4.5;
const GLTF_DEFAULT_CAMERA_Z = 3.5;
const JAW_OPEN_MULTIPLIER = 2.5;
const LEFTTOEBASE = 'LeftToeBase';
const LEFTFOOT = 'LeftFoot';
const LEFTLEG = 'LeftLeg';
const LEFTUPLEG = 'LeftUpLeg';
const SPINE = 'Spine';
const SPINE1 = 'Spine1';
const SPINE2 = 'Spine2';
const NECK = 'Neck';
const HEAD = 'Head';
const LEFTEYE = 'LeftEye';

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

  public magnifyMorphTargetValue = (
    morphTargetName: string,
    morphTargetMagnification: number
  ) => {
    if (morphTargetName in this.availableMorphTargets) {
      // only go through the components that contain this blendshape name
      for (const i in this.availableMorphTargets[morphTargetName]) {
        const morphTargetNewValue = rangeTransform(
          0,
          1,
          0,
          1,
          this.morphTargets[i][this.morphTargetsIndices[i][morphTargetName]] * morphTargetMagnification
        );
        this.morphTargets[i][this.morphTargetsIndices[i][morphTargetName]] = morphTargetNewValue;
      }
    }
  };

  public incrementMorphTargetValue = (
    morphTargetName: string,
    morphTargetValue: number
  ) => {
    if (morphTargetName in this.availableMorphTargets) {
      // only go through the components that contain this blendshape name
      for (const i in this.availableMorphTargets[morphTargetName]) {
        const morphTargetNewValue = rangeTransform(
          0,
          1,
          0,
          1,
          this.morphTargets[i][this.morphTargetsIndices[i][morphTargetName]] + morphTargetValue
        );
        this.morphTargets[i][this.morphTargetsIndices[i][morphTargetName]] = morphTargetNewValue;
      }
    }
  };
}

export class GLTFModel extends AvatarModel {
  private previewCanvas: HTMLCanvasElement;

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

  private avatarCanvasCtx: CanvasRenderingContext2D;

  private avatarCanvasInvisible: boolean;

  private neckRotationAssistX: number;

  private neckRotationAssistY: number;

  private neckRotationAssistZ: number;

  private neckRotationOrder: string[] = ['X', 'Y', 'Z'];

  private avatarModel: THREE.Group | null;

  private controls: OrbitControls;

  private boxResizeScale: number = 1;

  private boxCenterY: number = 0;

  private avatarDefaultPositionX: number = 0;

  private avatarDefaultPositionY: number = 0;

  private avatarDefaultPositionZ: number = 0;

  private faceTrackingX: number = 0;

  private faceTrackingY: number = 0;

  private faceTrackingZ: number = 0;

  private breathing: boolean = true;

  private breathingMotor: BreathingMotor;

  private lipSyncMouthY: number = 0; // Audio-based lip-sync

  constructor(previewCanvas?: HTMLCanvasElement, config?: any) {
    super('GLTFModel');
    this.previewCanvas = previewCanvas;

    // generate canvas element
    this.avatarCanvas = document.getElementById(
      'gltf-canvas'
    ) as HTMLCanvasElement;
    if (!this.avatarCanvas) {
      this.avatarCanvas = document.createElement('canvas');
      this.avatarCanvas.setAttribute('id', 'gltf-canvas');
      // Note: initially set display style none to hide the canvas, otherwise
      // it will somehow block the google meet top banner
      this.avatarCanvas.setAttribute('style', 'display: none');
      document.documentElement.appendChild(this.avatarCanvas);
    }
    this.avatarCanvasCtx = this.avatarCanvas.getContext('2d')!;
    this.avatarCanvasInvisible = true;

    // initialize three rendering environment
    this.scene = new THREE.Scene();
    this.loader = new GLTFLoader();
    this.avatarModel = null;
    this.pivot = new THREE.Group();
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.windowResolution.width / this.windowResolution.height,
      0.1,
      100
    );

    this.camera.position.set(0, 0, GLTF_DEFAULT_CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(
      this.windowResolution.width,
      this.windowResolution.height
    );

    // this will make the scene much brighter
    this.renderer.outputEncoding = THREE.sRGBEncoding;

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

    if (config) {
      this.loadConfig(config);
      this.bodyTracker = new BodyTracker(config?.bones);
    } else {
      this.bodyTracker = new BodyTracker();
    }
  }

  private adjustCameraToHead = (boneNode: THREE.Bone) => {
    if (
      [
        LEFTTOEBASE,
        LEFTFOOT,
        LEFTLEG,
        LEFTUPLEG,
        SPINE,
        SPINE1,
        SPINE2,
        NECK,
        HEAD,
        LEFTEYE,
      ].includes(boneNode.name)
    ) {
      // focus on head
      this.camera.position.setY(
        this.camera.position.y + boneNode.position.y * this.boxResizeScale
      );
    }
    if (boneNode.name === HEAD) {
      // reset original position from center to feet based
      this.camera.position.setY(this.camera.position.y - this.boxCenterY);
      // change field of view to show more parts of the head on the side
      this.camera.fov = 10;
      this.camera.updateProjectionMatrix();
    }
  };

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

      // Rescale the object to normalized space
      const size = box.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z);
      this.boxResizeScale = 0.8 / maxAxis;
      // Warning: do NOT use this.avatarModel.scale.multiplyScalar(this.boxResizeScale)
      // this will mess up with the hand tracking coordinate system, instead, we
      // should move the camera further away
      // TODO: improve camera positon and lookat based on fov calculation
      this.camera.position.setZ(GLTF_DEFAULT_CAMERA_Z + this.boxResizeScale * 15);

      const center = box.getCenter(new THREE.Vector3());
      box.setFromObject(this.avatarModel);
      box.getCenter(center);
      box.getSize(size);
      this.boxCenterY = center.y;

      this.avatarModel.position.x += this.avatarModel.position.x - center.x;
      this.avatarModel.position.y += this.avatarModel.position.y - center.y;
      this.avatarModel.position.z += this.avatarModel.position.z - center.z;

      this.scene.add(this.pivot);
      this.pivot.add(this.avatarModel);

      this.avatarDefaultPositionX = this.avatarModel.position.x;
      this.avatarDefaultPositionY = this.avatarModel.position.y;
      this.avatarDefaultPositionZ = this.avatarModel.position.z;

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
        }
        const boneNode = <THREE.Bone>node;
        if (boneNode.isBone) {
          this.boneCache.addBone(boneNode);
          // if head node exists, adjust camera position to head
          this.adjustCameraToHead(boneNode);
        }
      });

      // initialize body tracking model
      this.bodyTracker.init(this.avatarModel, false);

      this.controls = new OrbitControls(this.camera, this.previewCanvas);
      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
    } catch (e) {
      console.error(e);
    }
  }

  public loadConfig(config: any) {
    // adjust camera position
    if (config.camera) {
      const px = config.camera.posX ? config.camera.posX : 0;
      const py = config.camera.posY ? config.camera.posY : 0;
      const pz = config.camera.posZ ? config.camera.posZ : 1;
      this.camera.position.set(px, py, pz);
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
    this.lipSyncMouthY = volume;
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

      // make mouth movement more apparent
      this.morphTargetCache.magnifyMorphTargetValue(
        'jawOpen', JAW_OPEN_MULTIPLIER
      )

      // apply lipsync
      this.morphTargetCache.incrementMorphTargetValue(
        'jawOpen', this.lipSyncMouthY
      );

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

      // face tracking induced body movements
      if (this.freeMove) {
        this.faceTrackingX =
          -(facePrediction.normalizedImagePosition.x - 0.5) *
          FACE_MOVE_MULTIPLIER;
        this.faceTrackingY =
          (facePrediction.normalizedImagePosition.y - 0.5) * FACE_MOVE_MULTIPLIER;
        this.faceTrackingZ =
          (facePrediction.normalizedImageScale - 0.4) *
          FACE_DEPTH_MULTIPLIER *
          this.boxResizeScale;
      }

      if (this.avatarModel) {
        this.avatarModel.position.x =
          this.avatarDefaultPositionX + this.faceTrackingX;
        this.avatarModel.position.y =
          this.avatarDefaultPositionY + this.faceTrackingY;
        this.avatarModel.position.z =
          this.avatarDefaultPositionZ + this.faceTrackingZ;
      }

      // when the landmark prediction is available, make canvas element visible
      // in order to show the 3d model
      if (this.avatarCanvas && this.avatarCanvasInvisible) {
        this.avatarCanvasInvisible = false;
        this.avatarCanvas.style.display = 'block';
        this.avatarCanvas.style.position = 'absolute';
        this.avatarCanvas.style.top = '0';
        this.avatarCanvas.style.width = '100%';
        this.avatarCanvas.style.opacity = '0';
        this.avatarCanvas.style.zIndex = '-1';
      }
    }

    if (bodyPrediction) {
      this.bodyTracker.applyBodyTrackResults(bodyPrediction);
    }

    // automatic breathing motion
    if (this.breathing) {
      this.animateBreathingMotion();
    }

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // right after the rendering step, draw image on intermedia canvas
    if (this.avatarCanvas) {
      this.avatarCanvas.width = this.windowResolution.width;
      this.avatarCanvas.height = this.windowResolution.height;
      this.avatarCanvasCtx.drawImage(
        this.renderer.domElement,
        0,
        0,
        this.avatarCanvas.width,
        this.avatarCanvas.height
      );
    }

    this.controls.update();
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

  public resetCamera(): void {
    this.camera.position.set(0, 0, GLTF_DEFAULT_CAMERA_Z + this.boxResizeScale * 15);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
  }
}
