import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { NFTMetadata, AvatarModel } from '@/types';
import useStore from '@/utils/store';
import { GLTFModel } from '@/utils/gltfModel';
import useCharacterControls from '@/hooks/useCharacterControls';
import { CharacterController } from '@/utils/CharacterController';

interface AvatarProps {
  modelData: NFTMetadata;
  type: string; // avatar or clothing
}

const GLBModel = (props: AvatarProps) => {
  const { modelData, type } = props;
  const { gl, camera } = useThree();
  const selectedModel: any = useStore((state) => state.selectedModel);
  const trackingEnabled: any = useStore((state) => state.trackingEnabled);
  const capturingImage: any = useStore((state) => state.capturingImage);
  const setCapturingImage: any = useStore((state) => state.setCapturingImage);
  const setImageData: any = useStore((state) => state.setImageData);

  const { scene, animations } = useGLTF(modelData.model_url);
  const { ref, mixer, names, clips } = useAnimations(animations);
  const movements = useCharacterControls();

  const [currScene, setCurrScene] = useState(scene);
  const characterController = useRef<CharacterController>();

  // Handle GLB selection
  useEffect(() => {
    (async () => {
      useGLTF.preload(modelData.model_url);
      if (type === 'avatar') {
        // Load model
        const model: AvatarModel = new GLTFModel(
          gl,
          camera as THREE.PerspectiveCamera
        );
        selectedModel.current = model;
        await model.loadFile(scene);

        mixer.stopAllAction();
        characterController.current = null;
        // TEMP: play default animation if it's there
        if (clips && clips.length > 2 && modelData.name === 'BAYC') {
          mixer?.clipAction?.(clips[1], scene)?.play();
          characterController.current = new CharacterController(
            scene,
            camera,
            mixer,
            clips[2],
            clips[1]
          );
        }
      } else if (type === 'clothing') {
        // Load clothing if avatar exists
        if (selectedModel.current) {
          selectedModel.current.loadClothes(scene);
        }
      }
      setCurrScene(scene);
    })();
  }, [scene]);

  // Handle animation start/stop upon tracking enabling
  useEffect(() => {
    if (
      mixer &&
      mixer.clipAction &&
      clips.length > 2 &&
      characterController.current
    ) {
      if (trackingEnabled) {
        mixer?.clipAction(clips[1], scene)?.stop();
      } else {
        mixer?.clipAction(clips[1], scene)?.play();
      }
    }
  }, [trackingEnabled]);

  // Handle character movement
  useEffect(() => {
    if (type === 'avatar' && characterController.current) {
      characterController.current.update(movements);
    }
  }, [movements]);

  // Handle scene capturing
  useEffect(() => {
    if (capturingImage) {
      const imageData = gl.domElement.toDataURL();
      setImageData(imageData);
      setCapturingImage(false);
    }
  }, [capturingImage]);

  return <primitive object={currScene} />;
};

export default GLBModel;
