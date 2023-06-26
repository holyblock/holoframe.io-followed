import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AvatarModel } from '../types';
import {
  rangeTransform,
  faceRotationToBlendshapes,
  appleFaceDictionaryTransform,
  extractAppleMorphTargetDictionary,
  flipBlendShapes,
  BreathingMotor,
  BoneCache
} from './faceUtils';
import constants from '../config/constants';

const FACE_MOVE_MULTIPLIER = 0.25;
const FACE_DEPTH_MULTIPLIER = 1.5;
const GLTF_DEFAULT_CAMERA_Z = 3.5;
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

export class GLTFModel extends AvatarModel {
  private scene: THREE.Scene;
  private loader: GLTFLoader;
  private pivot: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private morphTargetCache: MorphTargetCache;
  private boneCache: BoneCache;
  private windowResolution: any = { width: 1280, height: 720 };
  private canvasCtx: CanvasRenderingContext2D;
  private canvasInvisible: boolean;
  private rotationAssistX: number;
  private rotationAssistY: number;
  private rotationAssistZ: number;
  private breathing: boolean = true;
  private breathingMotor: BreathingMotor;
  private faceModel: THREE.Group | null;
  private backgroundImage?: HTMLImageElement;
  private backgroundColor?: string;
  private boxResizeScale: number = 1;
  private boxCenterY: number = 0;
  private positionDefaultX: number = 0;
  private positionDefaultY: number = 0;
  private positionDefaultZ: number = 0;
  private positionCurrentX: number = 0;
  private positionCurrentY: number = 0;
  private positionCurrentZ: number = 0;
  private faceTrackingX: number = 0;
  private faceTrackingY: number = 0;
  private faceTrackingZ: number = 0;

  constructor(
    showDefaultBackground = false,
    defaultBackground?: string
  ) {
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
    this.faceModel = null;
    this.pivot = new THREE.Group();
    this.camera = new THREE.PerspectiveCamera(
      45, 1280 / 720, 0.1, 1000
    );

    this.camera.position.set(0, 0, GLTF_DEFAULT_CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.windowResolution.width, this.windowResolution.height);

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
    this.rotationAssistX = 0;
    this.rotationAssistY = 0;
    this.rotationAssistZ = 0;

    // initialize breathing motor
    this.breathingMotor = new BreathingMotor();

    // Set default background
    if (showDefaultBackground) {
      this.backgroundImage = new Image();
      this.backgroundImage.src = defaultBackground ?? constants.assets.defaultBackground;
      this.backgroundImage.crossOrigin = 'anonymous';
    }
  }

  private adjustCameraToHead = (boneNode: THREE.Bone) => {
    if ([LEFTTOEBASE, LEFTFOOT, LEFTLEG, LEFTUPLEG, SPINE, SPINE1, SPINE2, NECK, HEAD, LEFTEYE].includes(boneNode.name)) {
      // focus on head
      this.camera.position.setY(
        this.camera.position.y + boneNode.position.y * this.boxResizeScale
      );
    }
    if (boneNode.name === HEAD) {
      // reset original position from center to feet based
      this.camera.position.setY(
        this.camera.position.y - this.boxCenterY
      );
      // change field of view to show more parts of the head on the side
      this.camera.fov = 10;
      this.camera.updateProjectionMatrix();
      this.camera.position.setZ(
        this.camera.position.z - this.boxResizeScale
      );
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
      this.faceModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(this.faceModel);

      //Rescale the object to normalized space
      const size = box.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z);
      this.boxResizeScale = 0.8 / maxAxis;
      this.faceModel.scale.multiplyScalar(this.boxResizeScale);

      const center = box.getCenter(new THREE.Vector3());
      box.setFromObject(this.faceModel);
      box.getCenter(center);
      box.getSize(size);
      this.boxCenterY = center.y;
      this.faceModel.position.x += (this.faceModel.position.x - center.x);
      this.faceModel.position.y += (this.faceModel.position.y - center.y);
      this.faceModel.position.z += (this.faceModel.position.z - center.z);
      this.positionDefaultX = this.faceModel.position.x;
      this.positionDefaultY = this.faceModel.position.y;
      this.positionDefaultZ = this.faceModel.position.z;
      this.positionCurrentX = this.positionDefaultX;
      this.positionCurrentY = this.positionDefaultY;
      this.positionCurrentZ = this.positionDefaultZ;

      this.scene.add(this.faceModel);
      this.scene.add(this.pivot);
      this.pivot.add(this.faceModel);

      this.faceModel.traverse((node) => {
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
          // if head node exists, adjust camera position to head
          this.adjustCameraToHead(boneNode);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  public loadConfig(config: any) {
    // adjust camera position
    if (config.camera) {
      let px = config.camera.posX ? config.camera.posX : 0;
      let py = config.camera.posY ? config.camera.posY : 0;
      let pz = config.camera.posZ ? config.camera.posZ : 1;
      this.camera.position.set(px, py, pz);
      let lx = config.camera.lookX ? config.camera.lookX : 0;
      let ly = config.camera.lookY ? config.camera.lookY : 0;
      let lz = config.camera.lookZ ? config.camera.lookZ : 0;
      this.camera.lookAt(lx, ly, lz);
    }
    if (config.rotation) {
      this.rotationAssistX = config.rotation.x ? config.rotation.x : 0;
      this.rotationAssistY = config.rotation.y ? config.rotation.y : 0;
      this.rotationAssistZ = config.rotation.z ? config.rotation.z : 0;
      this.pivot.rotation.x = this.rotationAssistX;
      this.pivot.rotation.y = this.rotationAssistY;
      this.pivot.rotation.z = this.rotationAssistZ;
    }
  }

  public updateFrame(prediction: any) {
    if (prediction) {
      const blendshapes: any = flipBlendShapes(prediction.blendshapes);
      // facial expressions
      for (const [alterMorphTargetName, alterMorphTargetValue] of blendshapes) {
        this.morphTargetCache.applyMorphTargetValue(
          alterMorphTargetName, alterMorphTargetValue);
      }

      // face rotation (TEMP: negative signs)
      const rotationBlendshapes = faceRotationToBlendshapes(prediction.rotationQuaternion);
      const neckRotateX = rotationBlendshapes['headPitch'] + this.rotationAssistX;
      const neckRotateY = -rotationBlendshapes['headYaw'] + this.rotationAssistY;
      const neckRotateZ = -rotationBlendshapes['headRoll'] + this.rotationAssistZ;
      const neckRotated = this.boneCache.rotateNode(NECK, neckRotateX, neckRotateY, neckRotateZ);
      if (!neckRotated) {
        // if the neck node rotation isn't available, rotate the whole body
        this.pivot.rotation.x = neckRotateX;
        this.pivot.rotation.y = neckRotateY;
        this.pivot.rotation.z = neckRotateZ;
      }

      // iris tracking
      // TODO: implement this

      // face tracking induced body movements
      this.faceTrackingX = -(prediction.normalizedImagePosition.x - 0.5) * FACE_MOVE_MULTIPLIER;
      this.faceTrackingY = (prediction.normalizedImagePosition.y - 0.5) * FACE_MOVE_MULTIPLIER;
      this.faceTrackingZ = (prediction.normalizedImageScale - 0.4) * FACE_DEPTH_MULTIPLIER;

      // when the landmark prediction is available, make canvas element visible
      // in order to show the 3d model
      if (this.canvas && this.canvasInvisible) {
        this.canvasInvisible = false;
        this.canvas.style.display = 'block';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.opacity = '0';
        this.canvas.style.zIndex = '-1';
      }
    }

    // body position
    // note: this is put outside "if (prediction)" loop b/c we need
    // positionCurrentX/Y/Z to exert control regardless of face tracking
    if (this.faceModel) {
      this.faceModel.position.x = this.positionCurrentX + this.faceTrackingX;
      this.faceModel.position.y = this.positionCurrentY + this.faceTrackingY;
      this.faceModel.position.z = this.positionCurrentZ + this.faceTrackingZ;
    }

    // automatic breathing motion
    if (this.breathing) {
      this.animateBreathingMotion();
    }

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // right after the rendering step, draw image on intermedia canvas
    if (this.canvas) {
      this.canvas.width = this.windowResolution.width;
      this.canvas.height = this.windowResolution.height;
      
      this.canvasCtx.drawImage(
        this.renderer.domElement, 0, 0, this.windowResolution.width, this.windowResolution.height
      );
    }
  }

  public lookAt(x: number, y: number, z: number) {
    this.pivot.rotation.x = x;
    this.pivot.rotation.y = y;
    if (z) this.pivot.rotation.z = z;
  }

  public setModelPlacement = (x: number, y: number) => {
    if (this.faceModel) {
      this.positionCurrentX = this.positionDefaultX + (x - 0.5);
      this.positionCurrentY = this.positionDefaultY - (y - 0.5);
    }
  };

  public setSizeFactor = (factor: number) => {
    if (this.faceModel) {
      this.positionCurrentZ = this.positionDefaultZ + (factor - 1);
    }
  };

  public display(
    outCanvas: HTMLCanvasElement,
    outCanvasCtx: CanvasRenderingContext2D
  ) {
    if (this.canvas) {
      outCanvas.width = this.canvas.width;
      outCanvas.height = this.canvas.height;

      // Draw background image
      if (this.backgroundImage && this.backgroundImage.src) {
        outCanvasCtx.drawImage(this.backgroundImage, 0, 0, this.windowResolution.width, this.windowResolution.height);
      } else if (this.backgroundColor) {
        // Draw background color
        outCanvasCtx.fillStyle = this.backgroundColor;
        outCanvasCtx.fillRect(0, 0, this.windowResolution.width, this.windowResolution.height);
      }
      // Draw main avatar
      outCanvasCtx.drawImage(this.canvas, 0, 0, this.windowResolution.width, this.windowResolution.height);
    }
  }

  public setBackgroundImage = (imageUrl: string) => {
    // If background color exists, disable it
    if (this.backgroundColor) {
      this.backgroundColor = undefined;
    }
    if (!this.backgroundImage) {
      this.backgroundImage = new Image();
    }
    this.backgroundImage.src = imageUrl + '?test=123'; // HACK: fixes misleading chrome CORS error
    this.backgroundImage.crossOrigin = 'anonymous';
  }

  public setBackgroundColor = (colorHexCode: string) => {
    // If background image exists, disable it
    if (this.backgroundImage) {
      this.backgroundImage = undefined;
    }
    this.backgroundColor = colorHexCode;
  }
}