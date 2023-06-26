import { Movement } from '@/types';
import * as THREE from 'three';

export class CharacterController {
  // state
  scene: THREE.Scene;
  camera: THREE.Camera;
  mixer: THREE.AnimationMixer;
  rotateAngle: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  rotateQuaternion: THREE.Quaternion = new THREE.Quaternion();
  runAnimation: THREE.AnimationClip;
  idleAnimation: THREE.AnimationClip;

  constructor(scene, camera, mixer, runAnimation, idleAnimation) {
    this.scene = scene;
    this.camera = camera;
    this.mixer = mixer;
    this.runAnimation = runAnimation;
    this.idleAnimation = idleAnimation;
  }

  public update(movements: Movement) {
    // Update animation
    if (movements.forward) {
      this.mixer.clipAction(this.idleAnimation, this.scene).stop();
      this.mixer?.clipAction?.(this.runAnimation, this.scene)?.play();
    } else if (movements.backward) {
      this.mixer.clipAction(this.idleAnimation, this.scene).stop();
      this.mixer?.clipAction?.(this.runAnimation, this.scene)?.play();
    } else if (movements.left) {
      this.mixer.clipAction(this.idleAnimation, this.scene).stop();
      this.mixer?.clipAction?.(this.runAnimation, this.scene)?.play();
    } else if (movements.right) {
      this.mixer.clipAction(this.idleAnimation, this.scene).stop();
      this.mixer?.clipAction?.(this.runAnimation, this.scene)?.play();
    } else if (movements.jump) {
      this.mixer.clipAction(this.idleAnimation, this.scene).stop();
      this.mixer.clipAction(this.runAnimation, this.scene).stop();
    } else {
      this.mixer.clipAction(this.runAnimation, this.scene).stop();
      this.mixer.clipAction(this.idleAnimation, this.scene).play();
    }

    let directionOffset = this.directionOffset(movements);

    // rotate model
    let angleYCameraDirection = Math.atan2(
      this.camera.position.x - this.scene.position.x,
      this.camera.position.z - this.scene.position.z
    );
    this.rotateQuaternion.setFromAxisAngle(
      this.rotateAngle,
      angleYCameraDirection + directionOffset
    );
    this.scene.quaternion.rotateTowards(this.rotateQuaternion, 0.8);
  }

  private directionOffset(movement: Movement) {
    let directionOffset = 0; // w

    if (movement.backward) {
      if (movement.right) {
        directionOffset = Math.PI / 4; // w+a
      } else if (movement.left) {
        directionOffset = -Math.PI / 4; // w+d
      }
    } else if (movement.forward) {
      if (movement.right) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
      } else if (movement.left) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
      } else {
        directionOffset = Math.PI; // s
      }
    } else if (movement.right) {
      directionOffset = Math.PI / 2; // a
    } else if (movement.left) {
      directionOffset = -Math.PI / 2; // d
    }

    return directionOffset;
  }
}
