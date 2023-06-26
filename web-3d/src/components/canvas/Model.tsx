import { useEffect, useState } from 'react';
import * as THREE from 'three'
import useStore from '@/utils/store';
import GLBModel from './GLBModel';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

const Background = ({background}) => {
  const { gl } = useThree();
  // const texture = useTexture('/img/background2.jpg');
  const texture = useTexture(background);

  texture.encoding = THREE.sRGBEncoding;
  // Keep aspect ratio consistent
  const canvasAspect = gl.domElement.clientWidth / gl.domElement.clientHeight;
  const imageAspect = texture.image
    ? texture.image.width / texture.image.height
    : 1;
  const aspect = imageAspect / canvasAspect;

  texture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
  texture.repeat.x = aspect > 1 ? 1 / aspect : 1;

  texture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
  texture.repeat.y = aspect > 1 ? 1 : aspect;

  return <primitive attach="background" object={texture} />;
};

const Model = () => {
  const selectedModelData: any = useStore((state) => state.selectedModelData);
  const selectedClothingData: any = useStore(
    (state) => state.selectedClothingData
  );

  const selected2DEnvironmentData: any = useStore(
    (state) => state.selected2DEnvironmentData
  );

  const [render, setRender] = useState(1);

  useEffect(() => {
    setRender((render) => render + 1);
  }, [selectedModelData, selectedClothingData, selected2DEnvironmentData]);


  const renderClothing = selectedClothingData?.map((item) => {
    return <GLBModel modelData={item} type="clothing" key={item.model_url} />;
  });

  return (
    <>
      {/* Render Avatar */}
      {render && <GLBModel modelData={selectedModelData} type="avatar" />}
      {/* Render clothing */}
      {render && renderClothing}
      {/* Render environment */}
      {/* {render && <GLBModel modelData={selectedEnvironmentData} type='environment' />} */}
      { selected2DEnvironmentData.image && <Background background={selected2DEnvironmentData.image} /> } 
      <directionalLight position={[5, 5, 5]} />
      {/* <ambientLight /> */}
    </>
  );
};

export default Model;
