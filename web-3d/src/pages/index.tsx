import Closet from '@/components/dom/Closet';
import dynamic from 'next/dynamic';
import useStore from '@/utils/store';
import { useCanvas } from '@/contexts/CanvasContext';
import { useTracking } from '@/contexts/TrackingContext';
import AppNavigationBar from '@/components/dom/NavigationBar/AppNavigationBar';

const Model = dynamic(() => import('@/components/canvas/Model'), {
  ssr: false,
});

const Page = (props) => {
  const selectedModel: any = useStore((state) => state.selectedModel);
  const trackingEnabled = useStore((state) => state.trackingEnabled);
  const { predictFunc, bodyModel } = useTracking();
  const { videoRef } = useCanvas();

  const drawFrame = () => {
    if (trackingEnabled) {
      // Apply face and body capture
      let facePredictions = null;
      let bodyPredictions = null;
      if (predictFunc?.current) {
        facePredictions = predictFunc?.current?.call();
      }

      selectedModel.current?.updateFrame(facePredictions, null);
      requestAnimationFrame(drawFrame);
      // if (bodyModel.current) {
      //   bodyPredictions = bodyModel.current.prediction();
      // }
      // selectedModel.current?.updateFrame(facePredictions, bodyPredictions);
    }
  };

  return (
    <div className="relative w-full h-full">
      <AppNavigationBar />
      <video
        ref={videoRef}
        id="input-video"
        style={{ display: 'none' }}
        autoPlay
        crossOrigin="anonymous"
        onPlay={drawFrame}
      />
      <Closet />
    </div>
  );
};

Page.r3f = (props) => (
  <>
    <Model />
  </>
);

export default Page;

export async function getStaticProps() {
  return {
    props: {
      title: 'Index',
    },
  };
}
