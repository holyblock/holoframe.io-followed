import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMUtils } from '@pixiv/three-vrm';
import { AvatarModel } from '../types';
import {
  clamp,
  faceRotationToBlendshapes,
  rangeTransform,
  remap,
  undefTo0,
  BreathingMotor,
  BoneCache,
  flipBlendShapes,
  appleARKitToAlter
} from './faceUtils';
import constants from '../config/constants';

const VRM_DEFAULT_CAMERA_Z = 0.5;
const VRM_DEFAULT_POSITION_Y = -0.3;
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
  private canvasCtx: CanvasRenderingContext2D;
  private canvasInvisible: boolean;
  private faceModel: any;
  private boneCache: BoneCache;
  private breathing: boolean = true;
  private breathingMotor: BreathingMotor;
  private backgroundImage?: HTMLImageElement;
  private backgroundColor?: string;
  private clock: THREE.Clock;
  private positionDefaultX: number = 0;
  private positionDefaultY: number = 0;
  private positionDefaultZ: number = 0;
  private positionCurrentX: number = 0;
  private positionCurrentY: number = 0;
  private positionCurrentZ: number = 0;
  private faceTrackingX: number = 0;
  private faceTrackingY: number = 0;
  private faceTrackingZ: number = 0;
  private useArkitBlendshapes: boolean = false;
  private arkitBlendShapes: any = {};

  constructor(
    showDefaultBackground = false,
    defaultBackground?: string
  ) {
    super('VRMModel');

    // generate canvas element
    this.canvas = document.getElementById('vrm-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.setAttribute('id', 'vrm-canvas');
      // Note: initially set display style none to hide the canvas, otherwise
      // it will somehow block the google meet top banner
      this.canvas.setAttribute('style', 'display: none');
      document.documentElement.appendChild(this.canvas);
    }
    this.canvasCtx = this.canvas.getContext('2d')!;
    this.canvasInvisible = true;

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(1280, 720);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // initialize three rendering environment
    this.scene = new THREE.Scene();
    this.loader = new GLTFLoader();

    // camera
    this.camera = new THREE.PerspectiveCamera(
      30, 1280 / 720, 0.1, 20
    );
    this.camera.position.set(0, 0, VRM_DEFAULT_CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0, 1).normalize();
    directionalLight.intensity = 1;
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0x404040);
    ambientLight.intensity = 2;
    this.scene.add(ambientLight);

    // THREE clock for model update deltaTime
    this.clock = new THREE.Clock();

    // initialize face model
    this.faceModel = null;
    this.pivot = new THREE.Group();

    // initialize breathing motor
    this.breathingMotor = new BreathingMotor();

    // Set default background
    if (showDefaultBackground) {
      this.backgroundImage = new Image();
      this.backgroundImage.src = defaultBackground ?? constants.assets.defaultBackground;
      this.backgroundImage.crossOrigin = 'anonymous';
    }
  }

  // Load file asynchronously
  public async loadFile(path: string) {
    const gltf = await this.loader.loadAsync(path);
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.removeUnnecessaryJoints(gltf.scene);

    const vrm = await VRM.from(gltf); //.then((vrm) => {
    this.vrm = vrm;
    this.faceModel = vrm.scene;

    if (this.faceModel) {
      const box = new THREE.Box3().setFromObject(this.faceModel);

      //Rescale the object to normalized space
      const size = box.getSize(new THREE.Vector3());
      var maxAxis = Math.max(size.x, size.y, size.z);
      this.faceModel.scale.multiplyScalar(0.8 / maxAxis);

      const center = box.getCenter(new THREE.Vector3());
      box.setFromObject(this.faceModel);
      box.getCenter(center);
      box.getSize(size);
      this.faceModel.position.x += (this.faceModel.position.x - center.x);
      this.faceModel.position.y += (this.faceModel.position.y - center.y);
      this.faceModel.position.z += (this.faceModel.position.z - center.z);

      // re-center on face
      this.faceModel.position.y += VRM_DEFAULT_POSITION_Y;

      // register default world center
      if (this.vrm.humanoid) {
        const initPosition = this.vrm.humanoid!.humanBones.hips[0].node.position;
        this.positionDefaultX = initPosition.x;
        this.positionDefaultY = initPosition.y;
        this.positionDefaultZ = initPosition.z;
        this.positionCurrentX = this.positionDefaultX;
        this.positionCurrentY = this.positionDefaultY;
        this.positionCurrentZ = this.positionDefaultZ;
      }

      // turn the model to face camera
      this.pivot.rotation.y = Math.PI;

      this.scene.add(this.faceModel);
      this.scene.add(this.pivot);
      this.pivot.add(this.faceModel);

      // bone targets to move
      this.boneCache = new BoneCache();
      this.faceModel.traverse((node) => {
        const boneNode = <THREE.Bone>node;
        if (boneNode.isBone) {
          this.boneCache.addBone(boneNode);
        }
      });

      // put the arm down
      if (this.vrm.humanoid) {
        this.vrm.humanoid.humanBones.leftUpperArm[0].node.rotation.z = Math.PI / 3;
        this.vrm.humanoid.humanBones.rightUpperArm[0].node.rotation.z = -Math.PI / 3;
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

      // VRM model ready at this point
      this.modelReady = true;
    }
  }

  public loadConfig(config: any) {
    // adjust camera position
    if (config.camera) {
      let px = config.camera.posX ? config.camera.posX : 0;
      let py = config.camera.posY ? config.camera.posY : 0;
      let pz = config.camera.posZ ? config.camera.posZ : VRM_DEFAULT_CAMERA_Z;
      this.camera.position.set(px, py, pz);
      let lx = config.camera.lookX ? config.camera.lookX : 0;
      let ly = config.camera.lookY ? config.camera.lookY : 0;
      let lz = config.camera.lookZ ? config.camera.lookZ : 0;
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

  public updateFrame(prediction: any) {
    // facial expressions
    if (this.canvas && this.vrm && prediction && prediction.blendshapes && prediction.rotationQuaternion) {
      const blendshapes = Object.fromEntries(prediction.blendshapes);
      const blendShapeProxy = this.vrm.blendShapeProxy!;

      if (this.useArkitBlendshapes) {
        const flippedBlendshapes: any = flipBlendShapes(prediction.blendshapes);
        for (const [alterMorphTargetName, alterMorphTargetValue] of flippedBlendshapes) {
          if (alterMorphTargetName in this.arkitBlendShapes) {
            blendShapeProxy.setValue(this.arkitBlendShapes[alterMorphTargetName], alterMorphTargetValue);  
          }
        }

      } else {
        const eyeBlinkLeft = rangeTransform(0, 0.5, 0, 1, undefTo0(blendshapes['eyeBlink_L']));
        const eyeBlinkRight = rangeTransform(0, 0.5, 0, 1, undefTo0(blendshapes['eyeBlink_R']));
        const jawOpen = rangeTransform(0, 0.15, 0, 1, undefTo0(blendshapes['jawOpen']));
        const mouthSmileLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthSmile_L']));
        const mouthSmileRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthSmile_R']));
        const mouthLowerDownLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthLowerDownLeft']));
        const mouthLowerDownRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['mouthLowerDownRight']));

        this.faceTrackingX = (prediction.normalizedImagePosition.x - 0.5) * FACE_MOVE_MULTIPLIER;
        this.faceTrackingY = (prediction.normalizedImagePosition.y - 0.5) * FACE_MOVE_MULTIPLIER;
        this.faceTrackingZ = -(prediction.normalizedImageScale - 0.4) * FACE_DEPTH_MULTIPLIER;

        // convert mouth shape to a, e, i, o, u shape
        const mouthX = Math.max(mouthLowerDownLeft, mouthLowerDownRight, mouthSmileLeft, mouthSmileRight);
        const mouthI = clamp(remap(mouthX, 0, 1) * 2 * remap(jawOpen, 0.2, 0.7), 0, 1);
        const mouthA = jawOpen * 0.4 + jawOpen * (1 - mouthI) * 0.6;
        const mouthU = jawOpen * remap(1 - mouthI, 0, 0.3) * 0.1;
        const mouthE = remap(mouthU, 0.2, 1) * (1 - mouthI) * 0.3;
        const mouthO = (1 - mouthI) * remap(jawOpen, 0.3, 1) * 0.1;

        // convert mouth smile to joy level
        const joy = Math.max(mouthSmileLeft, mouthSmileRight) / 3;

        // apply blendshape
        blendShapeProxy.setValue(blendShapeProxy.blendShapePresetMap.blink_l!, eyeBlinkRight);
        blendShapeProxy.setValue(blendShapeProxy.blendShapePresetMap.blink_r!, eyeBlinkLeft);
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
        const eyeLookInLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookIn_L']));
        const eyeLookInRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookIn_R']));
        const eyeLookOutLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookOut_L']));
        const eyeLookOutRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookOut_R']));
        const eyeLookUpLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookUp_L']));
        const eyeLookUpRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookUp_R']));
        const eyeLookDownLeft = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookDown_L']));
        const eyeLookDownRight = rangeTransform(0, 1, 0, 1, undefTo0(blendshapes['eyeLookDown_R']));

        // convert to iris orientation
        const irisX = (eyeLookInLeft - eyeLookOutLeft + eyeLookOutRight - eyeLookInRight) / 2;
        const irisY = (eyeLookUpLeft - eyeLookDownLeft + eyeLookUpRight - eyeLookDownRight) / 2;
        this.vrm.humanoid.humanBones.leftEye[0].node.rotation.x = irisY / 10;
        this.vrm.humanoid.humanBones.leftEye[0].node.rotation.y = irisX / 5;
        this.vrm.humanoid.humanBones.rightEye[0].node.rotation.x = irisY / 10;
        this.vrm.humanoid.humanBones.rightEye[0].node.rotation.y = irisX / 5;

        // neck turning
        const rotationBlendshapes = faceRotationToBlendshapes(prediction.rotationQuaternion);
        this.vrm.humanoid.humanBones.neck[0].node.rotation.x = -rotationBlendshapes['headPitch'] * HEAD_PITCH_MULTIPLIER;
        this.vrm.humanoid.humanBones.neck[0].node.rotation.y = -rotationBlendshapes['headYaw'] * HEAD_YAW_MULTIPLIER;
        this.vrm.humanoid.humanBones.neck[0].node.rotation.z = rotationBlendshapes['headRoll'] * HEAD_ROLL_MULTIPLIER;
      }
    }

    // body position (it's a result of both mouse control and face detection)
    // note: this is put outside "if (prediction)" loop b/c we need
    // positionCurrentX/Y/Z to exert control regardless of face tracking
    if (this.faceModel) {
      this.vrm.humanoid.humanBones.hips[0].node.position.x = this.positionCurrentX + this.faceTrackingX;
      this.vrm.humanoid.humanBones.hips[0].node.position.y = this.positionCurrentY + this.faceTrackingY;
      this.vrm.humanoid.humanBones.hips[0].node.position.z = this.positionCurrentZ + this.faceTrackingZ;
    }

    // automatic breathing motion
    if (this.breathing) {
      this.animateBreathingMotion();
    }

    // update the physics
    const deltaTime = this.clock.getDelta();
    this.vrm.update(deltaTime);

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // right after the rendering step, draw image on intermedia canvas
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.canvasCtx.drawImage(
      this.renderer.domElement, 0, 0, this.canvas.width, this.canvas.height
    );

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

  public setBackgroundImage = (imageUrl: string) => {
    // If background color exists, disable it
    if (this.backgroundColor) {
      this.backgroundColor = undefined;
    }
    if (!this.backgroundImage) {
      this.backgroundImage = new Image();
    }
    this.backgroundImage.src = imageUrl + '?test=123';
    this.backgroundImage.crossOrigin = 'anonymous';
  }

  public setBackgroundColor = (colorHexCode: string) => {
    // If background image exists, disable it
    if (this.backgroundImage) {
      this.backgroundImage = undefined;
    }
    this.backgroundColor = colorHexCode;
  }

  public setModelPlacement = (x: number, y: number) => {
    if (this.faceModel) {
      this.positionCurrentX = this.positionDefaultX - (x - 0.5);
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
        const width = this.backgroundImage.width;
        const height = this.backgroundImage.height;
        const ratio = Math.max(
          outCanvas.width / width,
          outCanvas.height / height
        );
        // get the top left position of the image
        const x = (outCanvas.width / 2) - (width / 2) * ratio;
        const y = (outCanvas.height / 2) - (height / 2) * ratio;
        outCanvasCtx.drawImage(this.backgroundImage, x, y, width * ratio, height * ratio);
      } else if (this.backgroundColor) {
        // Draw background color
        outCanvasCtx.fillStyle = this.backgroundColor;
        outCanvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      // Draw main avatar
      outCanvasCtx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);
    }
  }
}