import { useEffect, useRef, useState } from 'react';
import useStore from '@/utils/store';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  PerspectiveCamera,
  OrbitControls,
  OrthographicCamera,
} from '@react-three/drei';
import { gsap } from 'gsap';

const CAMERA_POS = {
  default: { x: 0, y: 0.93, z: 2.75 },
  closet: { x: -0.5, y: 0.8, z: 2.7 },
  settings: { x: -0.5, y: 0.8, z: 2.7 },
};

const LControl = ({ control }) => {
  const dom: any = useStore((state) => state.dom);

  useEffect(() => {
    if (control.current) {
      const domElement = dom.current;
      const originalTouchAction = domElement.style['touch-action'];
      domElement.style['touch-action'] = 'none';

      return () => {
        domElement.style['touch-action'] = originalTouchAction;
      };
    }
  }, [dom, control]);
  // @ts-ignore
  return (
    <OrbitControls
      makeDefault={true}
      enableZoom={false}
      enablePan={false}
      ref={control}
      domElement={dom.current}
    />
  );
};

const Camera = () => {
  const uiMode: any = useStore((state) => state.uiMode);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const control = useRef<any>(null);
  const currPos = useRef<any>(CAMERA_POS.default);
  const [transitioning, setTransitioning] = useState(true);

  useFrame(() => {
    if (transitioning) {
      gsap.to(cameraRef.current.position, {
        x: () => currPos.current?.x,
        y: () => currPos.current?.y,
        z: () => currPos.current?.z,
        duration: 0.5,
        immediateRender: true,
        onComplete: () => {
          setTransitioning(false);
        },
      });
    } else {
      currPos.current = {
        x: cameraRef.current?.position?.x,
        y: cameraRef.current?.position?.y,
        z: cameraRef.current?.position?.z,
      };
      // control?.current?.update()
      if (control.current) {
        // cameraRef.current.lookAt(control?.current?.target);
        control.current.update();
      }
    }
  });

  useEffect(() => {
    currPos.current = CAMERA_POS['default'];
    setTransitioning(true);
  }, []);

  const MainCamera = PerspectiveCamera as any;

  return (
    // <>
    //   {mode === 'default' && <ThirdPersonCamera />}
    //   {mode === 'closet' && <ClosetCamera />}
    // </>
    <>
      <MainCamera ref={cameraRef} makeDefault />
      {/* <LControl control={control} /> */}
    </>
  );
};

export default Camera;
