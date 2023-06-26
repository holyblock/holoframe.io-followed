import { NFTMetadata } from '@/types';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import useStore from '@/utils/store';

import Environments from './Environments';
import { BrushIcon } from '@/components/Icons/BrushIcon';
import { CameraIcon } from '@/components/Icons/CameraIcon';
import { FaceTrackingIcon } from '@/components/Icons/FaceTrackingIcon';
import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';

enum ModalMode {
  Hidden,
  SCENE,
  CAMERA,
  FACETRACKING,
}

const StudioDom = () => {
  const [currentMode, setCurrentMode] = useState<ModalMode>(ModalMode.Hidden);

  return (
    <div className="relative h-full pt-[0px]">
      <button
        className={classNames({
          'absolute rounded-full top-[calc(50%-140px)] w-[90px] h-[90px]': true,
          'right-[430px]': currentMode !== ModalMode.Hidden,
          'right-[30px]': currentMode === ModalMode.Hidden,
          'bg-white color-black': currentMode === ModalMode.SCENE,
          'bg-[#73CEC370]': currentMode !== ModalMode.SCENE,
        })}
        onClick={() => {
          setCurrentMode(
            currentMode === ModalMode.SCENE
              ? ModalMode.Hidden
              : ModalMode.SCENE
          );
        }}
      >
        <BrushIcon
          h={8}
          w={8}
          fill={currentMode === ModalMode.SCENE ? 'white' : '#73CEC370'}
          color={currentMode === ModalMode.SCENE ? 'black' : 'white'}
        />
      </button>
      <button
        className={classNames({
          'absolute rounded-full right-[65px] top-[calc(50%-35px)] w-[90px] h-[90px] bg-[#73CEC370]':
            true,
          'right-[465px]': currentMode !== ModalMode.Hidden,
          'right-[65x]': currentMode === ModalMode.Hidden,
        })}
      >
        <CameraIcon h={8} w={8} color="white" />
      </button>
      <button
        className={classNames({
          'absolute rounded-full top-[calc(50%+70px)] w-[90px] h-[90px] bg-[#73CEC370]':
            true,
          'right-[430px]': currentMode !== ModalMode.Hidden,
          'right-[30px]': currentMode === ModalMode.Hidden,
        })}
      >
        <FaceTrackingIcon h={8} w={8} color="white" />
      </button>
      <button
        className={classNames({
          'absolute top-[calc(50%-72px)] max-w-[38px] overflow-hidden': true,
          'right-[400px]': currentMode !== ModalMode.Hidden,
          'right-[0px]': currentMode === ModalMode.Hidden,
        })}
      >
        <div className="flex items-center border rounded-l-full border-denim-blue/[0.15] bg-dark-turquoise/[0.08] w-[144px] h-[144px]">
          {currentMode === ModalMode.Hidden ? (
            <ChevronLeftIcon
              h={10}
              w={10}
              color="white"
              className="float-left"
            />
          ) : (
            <ChevronRightIcon
              h={10}
              w={10}
              color="white"
              className="float-left"
            />
          )}
        </div>
      </button>
      <Environments isVisible={currentMode === ModalMode.SCENE} />
    </div>
  );
};

export default StudioDom;
