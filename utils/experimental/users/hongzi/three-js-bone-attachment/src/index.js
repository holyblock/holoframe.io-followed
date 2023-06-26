import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const AVATAR_PATH = './ape_base_model.glb'
const CLOTHING_PATH = './ape_coat.glb'
const THREE_TONE_PATH = './threeTone.jpg';
let avatarModel = null;
let clothesModel = null;
const avatarBones = {};
const clothesBones = {};

// for attaching cloeth mesh to body bones
let skeleton = null;
const clothesMesh = {};

const scene = new THREE.Scene();
const loader = new GLTFLoader();
const pivot = new THREE.Group();
const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 1000
);
const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x444444);
renderer.setSize(window.innerWidth, window.innerHeight);
// alternatively, can drawImage on another canvas
document.body.appendChild(renderer.domElement);

// mouse interaction
const orbitControls = new OrbitControls(camera, renderer.domElement);

// this will make the scene much brighter
renderer.outputEncoding = THREE.sRGBEncoding

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 300, 0);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(75, 300, -75);
scene.add(dirLight);

// ----------------------
// cel shading mapping
// ----------------------
const threeTone = new THREE.TextureLoader().load(THREE_TONE_PATH);
threeTone.minFilter = THREE.NearestFilter;
threeTone.magFilter = THREE.NearestFilter;

// load base model
loader.load(
  AVATAR_PATH,

  // called when the resource is loaded
  function (gltf) {
    avatarModel = gltf.scene;
    camera.position.set(0, 0, 5);

    avatarModel.traverse((node) => {
      if (node.isBone) {
        avatarBones[node.name] = node;
      }
      if (node.isMesh) {
        if (skeleton === null) {  // only need one skeleton
          skeleton = node.skeleton;
        }
      }
      // apply cel shading
      if (node.material) {
        const oldMat = node.material;
        const toonMat = new THREE.MeshToonMaterial({
          color: '#ffffff',
          gradientMap: threeTone
        });
        toonMat.map = oldMat.map;
        node.material = toonMat;
      }
    });

    scene.add(avatarModel);
    scene.add(pivot);
    pivot.add(avatarModel);

    // gltf.animations; // Array<THREE.AnimationClip>
    // gltf.scene; // THREE.Group
    // gltf.scenes; // Array<THREE.Group>
    // gltf.cameras; // Array<THREE.Camera>
    // gltf.asset; // Object

    // now loads clothing model
    loader.load(
      CLOTHING_PATH,

      // called when the resource is loaded
      function (gltf) {
        clothesModel = gltf.scene;

        scene.add(clothesModel);
        scene.add(pivot);
        pivot.add(clothesModel);

        clothesModel.traverse((node) => {
          if (node.isBone) {
            clothesBones[node.name] = node;
          }
          if (node.isMesh) {
            clothesMesh[node.name] = node;
          }
          // apply cel shading
          if (node.material) {
            const oldMat = node.material;
            const toonMat = new THREE.MeshToonMaterial({
              color: '#ffffff',
              gradientMap: threeTone
            });
            toonMat.map = oldMat.map;
            node.material = toonMat;
          }
        });
      },
    );
  },
);

let doItOnce = true;
function animate() {
  requestAnimationFrame(animate);

  // rotate arm
  clock.getDelta();
  const s = 0.25 * Math.PI * Math.sin(Math.PI * clock.elapsedTime);

  // do it here just to make sure skeleton and clothing mesh are ready
  if (doItOnce) {
    if (skeleton && Object.keys(clothesMesh).length > 0) {
      for (const [k, v] of Object.entries(clothesMesh)) {
        v.skeleton = skeleton;  // main sauce
      }
    }
  }

  if ('LeftArm' in avatarBones && 'LeftArm' in clothesBones) {
    avatarBones['LeftArm'].rotation.y = s;
  }

  if ('RightArm' in avatarBones && 'RightArm' in clothesBones) {
    avatarBones['RightArm'].rotation.z = s;
  }

  renderer.render(scene, camera);
}
animate();