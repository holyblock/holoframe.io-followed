import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Preload } from '@react-three/drei';
import useStore from '@/utils/store';
import Camera from '../canvas/Camera';

// const LControl = () => {
//   const dom: any = useStore((state) => state.dom)
//   const control = useRef(null)

//   useEffect(() => {
//     if (control.current) {
//       const domElement = dom.current
//       const originalTouchAction = domElement.style['touch-action']
//       domElement.style['touch-action'] = 'none'

//       return () => {
//         domElement.style['touch-action'] = originalTouchAction
//       }
//     }
//   }, [dom, control])
//   // @ts-ignore
//   return <OrbitControls enableZoom={false} enablePan={false} ref={control} domElement={dom.current} />
// }
const LCanvas = ({ children }) => {
  const dom: any = useStore((state) => state.dom);
  return (
    <Canvas
      className="absolute top-0 z-10 min-w-[1000px] max-lg:left-44"
      gl={{ preserveDrawingBuffer: true }}
      onCreated={(state) => state.events.connect(dom.current)}
    >
      <Camera />
      {/* <LControl /> */}
      <Preload all />
      {children}
    </Canvas>
  );
};

export default LCanvas;
