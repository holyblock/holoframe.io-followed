import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRM, VRMUtils } from '@pixiv/three-vrm';
import { AvatarModel, Size, Placement } from '../types';
import {
  clamp,
  faceRotationToBlendshapes,
  rangeTransform,
  remap,
  undefTo0,
} from './faceUtils';
import {
  appleARKitToAlter,
  BreathingMotor,
  flipBlendShapes
} from '../../../../plugins/studio/src/utils/faceUtils';
import BodyTracker from './bodyUtils';

const VRM_DEFAULT_CAMERA_Z = -0.9;
const VRM_DEFAULT_POSITION_Y = -0.6;
const INITIAL_SIZE_FACTOR = 1;
const FACE_MOVE_MULTIPLIER = 0.5;
const FACE_DEPTH_MULTIPLIER = 2;
const HEAD_PITCH_MULTIPLIER = 3;
const HEAD_YAW_MULTIPLIER = 2;
const HEAD_ROLL_MULTIPLIER = 2;

export class VRMModel extends AvatarModel {
  private vrm: VRM | undefined;

  private scene: THREE.Scene;

  private loader: GLTFLoader;

  private pivot: THREE.Group;

  private camera: THREE.PerspectiveCamera;

  private renderer: THREE.WebGLRenderer;

  public avatarPlacement: Placement = {
    x: 0,
    y: 0,
  };

  public avatarSize: Size = {
    width: 0,
    height: 0,
    zoomFactor: INITIAL_SIZE_FACTOR,
  };

  private windowResolution: Size = { width: 1280, height: 720 };

  private previewCanvas: HTMLCanvasElement;

  private avatarCanvasCtx: CanvasRenderingContext2D;

  private avatarCanvasInvisible: boolean;

  private faceModel: any;

  private breathing: boolean = true;

  private breathingMotor: BreathingMotor;

  private useArkitBlendshapes: boolean = false;

  private arkitBlendShapes: any = {};

  private clock: THREE.Clock;

  private bodyTracker: BodyTracker;

  private positionDefaultX: number = 0;

  private positionDefaultY: number = 0;

  private positionDefaultZ: number = 0;

  private lipSyncMouthY: number = 0; // Audio-based lip-sync

  private controls: OrbitControls;

  constructor(previewCanvas?: HTMLCanvasElement, config?: any) {
    super('VRMModel');
    this.previewCanvas = previewCanvas;

    // generate canvas element
    this.avatarCanvas = document.getElementById(
      'vrm-canvas'
    ) as HTMLCanvasElement;
    if (!this.avatarCanvas) {
      this.avatarCanvas = document.createElement('canvas');
      this.avatarCanvas.setAttribute('id', 'vrm-canvas');
      // Note: initially set display style none to hide the canvas, otherwise
      // it will somehow block the google meet top banner
      this.avatarCanvas.setAttribute('style', 'display: none');
      document.documentElement.appendChild(this.avatarCanvas);
    }
    this.avatarCanvasCtx = this.avatarCanvas.getContext('2d')!;
    this.avatarCanvasInvisible = true;

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(
      this.windowResolution.width,
      this.windowResolution.height
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // initialize three rendering environment
    this.scene = new THREE.Scene();
    this.loader = new GLTFLoader();

    // camera
    this.camera = new THREE.PerspectiveCamera(
      30,
      this.windowResolution.width / this.windowResolution.height,
      0.1,
      20
    );
    this.camera.position.set(0, 0, VRM_DEFAULT_CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0, -1).normalize();
    directionalLight.intensity = 1;
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0x404040);
    ambientLight.intensity = 2;
    this.scene.add(ambientLight);

    // THREE clock for model update deltaTime
    this.clock = new THREE.Clock();

    // initialize full body motion tracker
    this.bodyTracker = new BodyTracker();

    // initialize face model
    this.faceModel = null;
    this.pivot = new THREE.Group();

    // initialize breathing motor
    this.breathingMotor = new BreathingMotor();

    if (config) {
      this.loadConfig(config);
    }
  }

  // Load file asynchronously
  public async loadFile(path: string) {
    const gltf = await this.loader.loadAsync(path);
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.removeUnnecessaryJoints(gltf.scene);

    const vrm = await VRM.from(gltf); // .then((vrm) => {
    this.vrm = vrm;
    this.faceModel = vrm.scene;

    if (this.faceModel) {
      const box = new THREE.Box3().setFromObject(this.faceModel);

      // Rescale the object to normalized space
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      box.setFromObject(this.faceModel);
      box.getCenter(center);
      box.getSize(size);
      this.faceModel.position.x += this.faceModel.position.x - center.x;
      this.faceModel.position.y += this.faceModel.position.y - center.y;
      this.faceModel.position.z += this.faceModel.position.z - center.z;

      // re-center on face
      this.faceModel.position.y += VRM_DEFAULT_POSITION_Y;

      // register default world center
      if (this.vrm.humanoid) {
        const initPosition =
          this.vrm.humanoid!.humanBones.hips[0].node.position;
        this.positionDefaultX = initPosition.x;
        this.positionDefaultY = initPosition.y;
        this.positionDefaultZ = initPosition.z;
      }

      this.scene.add(this.faceModel);
      this.scene.add(this.pivot);
      this.pivot.add(this.faceModel);

      // put the arm down
      if (this.vrm.humanoid) {
        this.vrm.humanoid.humanBones.leftUpperArm[0].node.rotation.z =
          Math.PI / 3;
        this.vrm.humanoid.humanBones.rightUpperArm[0].node.rotation.z =
          -Math.PI / 3;
      }

      // check if the model contains ARKit compatible blendshapes
      if (this.vrm.blendShapeProxy.unknownGroupNames.includes('eyeBlinkLeft') &&
          this.vrm.blendShapeProxy.unknownGroupNames.includes('eyeBlinkRight') &&
          this.vrm.blendShapeProxy.unknownGroupNames.includes('jawOpen')) {
        this.useArkitBlendshapes = true;
        for (const blendshape of this.vrm.blendShapeProxy.unknownGroupNames) {
          if (blendshape in appleARKitToAlter) {
            this.arkitBlendShapes[appleARKitToAlter[blendshape]] = blendshape;
          }
        }
      }

      // initialize body tracking model
      this.bodyTracker.init(this.faceModel, true);

      // enable mouse control
      this.controls = new OrbitControls(this.camera, this.previewCanvas);
      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };

      // VRM model ready at this point
      this.modelReady = true;
    }
  }

  public loadConfig(config: any) {
    // adjust camera position
    if (config.camera) {
      const px = config.camera.posX ? config.camera.posX : 0;
      const py = config.camera.posY ? config.camera.posY : 0;
      const pz = config.camera.posZ ? config.camera.posZ : VRM_DEFAULT_CAMERA_Z;
      this.camera.position.set(px, py, pz);
      const lx = config.camera.lookX ? config.camera.lookX : 0;
      const ly = config.camera.lookY ? config.camera.lookY : 0;
      const lz = config.camera.lookZ ? config.camera.lookZ : 0;
      this.camera.lookAt(lx, ly, lz);
    }
  }

  private animateBreathingMotion = () => {
    const spineAngleDiffX = this.breathingMotor.getSinOffset(800, false);
    const neckAngleDiffX = this.breathingMotor.getSinOffset(800, false);
    const neckAngleDiffY = this.breathingMotor.getSinOffset(1600, true);
    this.vrm.humanoid.humanBones.spine[0].node.rotation.x += 0.04 * spineAngleDiffX;
    this.vrm.humanoid.humanBones.neck[0].node.rotation.x += 0.06 * neckAngleDiffX;
    this.vrm.humanoid.humanBones.neck[0].node.rotation.y += 0.03 * neckAngleDiffY;
  };

  public updateLipSync = (volume: number) => {
    this.lipSyncMouthY = volume;
  };

  public updateFrame(facePrediction: any, bodyPrediction: any) {
    // facial expressions
    if (
      this.avatarCanvas &&
      this.vrm &&
      facePrediction &&
      facePrediction.blendshapes &&
      facePrediction.rotationQuaternion
    ) {
      const blendshapes = Object.fromEntries(facePrediction.blendshapes);
      const blendShapeProxy = this.vrm.blendShapeProxy!;

      if (this.useArkitBlendshapes) {
        const flippedBlendshapes: any = flipBlendShapes(facePrediction.blendshapes);
        for (const [alterMorphTargetName, alterMorphTargetValue] of flippedBlendshapes) {
          if (alterMorphTargetName in this.arkitBlendShapes) {
            blendShapeProxy.setValue(this.arkitBlendShapes[alterMorphTargetName], alterMorphTargetValue);  
          }
        }

      } else {
        const eyeBlinkLeft = rangeTransform(
          0,
          0.5,
          0,
          1,
          undefTo0(blendshapes.eyeBlink_L)
        );
        const eyeBlinkRight = rangeTransform(
          0,
          0.5,
          0,
          1,
          undefTo0(blendshapes.eyeBlink_R)
        );
        const jawOpen = rangeTransform(
          0,
          0.15,
          0,
          1,
          undefTo0(blendshapes.jawOpen) + this.lipSyncMouthY
        );
        const mouthSmileLeft = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.mouthSmile_L)
        );
        const mouthSmileRight = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.mouthSmile_R)
        );
        const mouthLowerDownLeft = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.mouthLowerDownLeft)
        );
        const mouthLowerDownRight = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.mouthLowerDownRight)
        );

        // convert mouth shape to a, e, i, o, u shape
        const mouthX = Math.max(
          mouthLowerDownLeft,
          mouthLowerDownRight,
          mouthSmileLeft,
          mouthSmileRight
        );
        const mouthI = clamp(
          remap(mouthX, 0, 1) * 2 * remap(jawOpen, 0.2, 0.7),
          0,
          1
        );
        const mouthA = jawOpen * 0.4 + jawOpen * (1 - mouthI) * 0.6;
        const mouthU = jawOpen * remap(1 - mouthI, 0, 0.3) * 0.1;
        const mouthE = remap(mouthU, 0.2, 1) * (1 - mouthI) * 0.3;
        const mouthO = (1 - mouthI) * remap(jawOpen, 0.3, 1) * 0.1;

        // convert mouth smile to joy level
        const joy = Math.max(mouthSmileLeft, mouthSmileRight) / 3;

        // apply blendshape
        blendShapeProxy.setValue(
          blendShapeProxy.blendShapePresetMap.blink_l!,
          eyeBlinkRight
        );
        blendShapeProxy.setValue(
          blendShapeProxy.blendShapePresetMap.blink_r!,
          eyeBlinkLeft
        );
        blendShapeProxy.setValue(blendShapeProxy.blendShapePresetMap.a!, mouthA);
        blendShapeProxy.setValue(blendShapeProxy.blendShapePresetMap.e!, mouthE);
        blendShapeProxy.setValue(blendShapeProxy.blendShapePresetMap.i!, mouthI);
        blendShapeProxy.setValue(blendShapeProxy.blendShapePresetMap.o!, mouthO);
        blendShapeProxy.setValue(blendShapeProxy.blendShapePresetMap.u!, mouthU);
        blendShapeProxy.setValue(blendShapeProxy.blendShapePresetMap.joy!, joy);
      }
      if (this.vrm.humanoid) {
        // iris tracking
        // Note: rotation.y is horizontal, rotation.x is vertical
        const eyeLookInLeft = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.eyeLookIn_L)
        );
        const eyeLookInRight = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.eyeLookIn_R)
        );
        const eyeLookOutLeft = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.eyeLookOut_L)
        );
        const eyeLookOutRight = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.eyeLookOut_R)
        );
        const eyeLookUpLeft = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.eyeLookUp_L)
        );
        const eyeLookUpRight = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.eyeLookUp_R)
        );
        const eyeLookDownLeft = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.eyeLookDown_L)
        );
        const eyeLookDownRight = rangeTransform(
          0,
          1,
          0,
          1,
          undefTo0(blendshapes.eyeLookDown_R)
        );

        // convert to iris orientation
        const irisX =
          (eyeLookInLeft - eyeLookOutLeft + eyeLookOutRight - eyeLookInRight) / 2;
        const irisY =
          (eyeLookUpLeft - eyeLookDownLeft + eyeLookUpRight - eyeLookDownRight) /
          2;

        this.vrm.humanoid.humanBones.leftEye[0].node.rotation.x = irisY / 10;
        this.vrm.humanoid.humanBones.leftEye[0].node.rotation.y = irisX / 5;
        this.vrm.humanoid.humanBones.rightEye[0].node.rotation.x = irisY / 10;
        this.vrm.humanoid.humanBones.rightEye[0].node.rotation.y = irisX / 5;

        // body position induced from face tracking
        if (this.freeMove) {
          this.vrm.humanoid.humanBones.hips[0].node.position.x =
            (facePrediction.normalizedImagePosition.x - 0.5) *
              FACE_MOVE_MULTIPLIER +
            this.positionDefaultX;
          this.vrm.humanoid.humanBones.hips[0].node.position.y =
            (facePrediction.normalizedImagePosition.y - 0.5) *
              FACE_MOVE_MULTIPLIER +
            this.positionDefaultY;
          this.vrm.humanoid.humanBones.hips[0].node.position.z =
            -(facePrediction.normalizedImageScale - 0.4) * FACE_DEPTH_MULTIPLIER +
            this.positionDefaultZ;
        }

        // neck turning
        const rotationBlendshapes = faceRotationToBlendshapes(
          facePrediction.rotationQuaternion
        );
        this.vrm.humanoid.humanBones.neck[0].node.rotation.x =
          -rotationBlendshapes.headPitch * HEAD_PITCH_MULTIPLIER;
        this.vrm.humanoid.humanBones.neck[0].node.rotation.y =
          -rotationBlendshapes.headYaw * HEAD_YAW_MULTIPLIER;
        this.vrm.humanoid.humanBones.neck[0].node.rotation.z =
          rotationBlendshapes.headRoll * HEAD_ROLL_MULTIPLIER;
      }
    }

    // body tracking (if available)
    if (bodyPrediction) {
      this.bodyTracker.applyBodyTrackResults(bodyPrediction);
    }

    // automatic breathing motion
    if (this.breathing) {
      this.animateBreathingMotion();
    }

    // update the blenshape
    const deltaTime = this.clock.getDelta();
    this.vrm.update(deltaTime);

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // right after the rendering step, draw image on intermedia canvas
    this.avatarCanvas.width = this.windowResolution.width;
    this.avatarCanvas.height = this.windowResolution.height;
    this.avatarCanvasCtx.drawImage(
      this.renderer.domElement,
      0,
      0,
      this.avatarCanvas.width,
      this.avatarCanvas.height
    );

    // when the landmark facePrediction is available, make canvas element visible
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

    this.controls.update();
  }

  public setModelPlacement = (x: number, y: number) => {};

  public setSizeFactor = (factor: number) => {
    if (this.vrm && this.vrm.humanoid) {
      this.vrm.humanoid.humanBones.hips[0].node.position.z =
        this.positionDefaultZ - (factor - 1);
    }
  };

  public display(canvasSize: Size, outCanvasCtx: CanvasRenderingContext2D) {
    if (this.avatarCanvas) {
      // Draw main avatar
      outCanvasCtx.drawImage(
        this.avatarCanvas,
        0,
        0,
        this.windowResolution.width,
        this.windowResolution.height
      );
    }
  }

  public resetCamera(): void {
    this.camera.position.set(0, 0, VRM_DEFAULT_CAMERA_Z);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
  }
}
