import React, { useEffect } from 'react';
import { 
  IconButton,
  Stack,
  Tooltip
} from '@chakra-ui/react';
import { AiOutlinePicture } from 'react-icons/ai';
import { 
  BsGrid,
  BsPerson, 
} from 'react-icons/bs';
import { MdOutlineCamera } from 'react-icons/md';

import { useStyle } from '../contexts/StyleContext';
import { AvatarModel } from '../types';
import { colors } from '../styles/theme';

interface AvatarStudioToolbarProps {
  selectedView: string
  setSelectedView: (view: string) => void
  avatarModel: AvatarModel | null
  canvas: HTMLCanvasElement | null
  expressions: Map<string, Array<Object>> | undefined
  video: HTMLVideoElement | null
  pictureInPicture: HTMLVideoElement | null
  setFullscreen: (isFullscreen: boolean) => void
}

const StudioToolbar = (props: AvatarStudioToolbarProps) => {
  const { 
    selectedView,
    setSelectedView,
    pictureInPicture,
  } = props;
  const { darkEnabled } = useStyle();
  const iconColor = darkEnabled ? 'white' : 'black';
  
  // Exit picture in picture upon router change
  useEffect(() => {
    const unmount = () => {
      if (pictureInPicture === (document as any).pictureInPictureElement) {
        (document as any).exitPictureInPicture();
      }
    }
    window.onbeforeunload = unmount;
  }, []);


  return (
    <Stack spacing={4} py={4} direction='row' display='flex' alignItems='center' justifyContent='center'>
       <Tooltip label='Choose your character'>
        <IconButton 
          aria-label='Grid'
          icon={<BsGrid fontSize='30px' />}
          bg='transparent'
          color={selectedView === 'avatarGrid' ? colors.brand.primary : iconColor}
          _hover={{
            cursor: 'pointer',
            color: colors.brand.primary
          }}
          onClick={() => setSelectedView('avatarGrid')}
        />
      </Tooltip>
      <Tooltip label='Customize your character'>
        <IconButton 
          aria-label='Customize'
          icon={<BsPerson fontSize='30px' />}
          bg='transparent'
          color={selectedView === 'customize' ? colors.brand.primary : iconColor}
          _hover={{
            cursor: 'pointer',
            color: colors.brand.primary
          }}
          onClick={() => setSelectedView('customize')}
        />
      </Tooltip>
      <Tooltip label='Change your background'>
        <IconButton 
          aria-label='Background Selector'
          icon={<AiOutlinePicture fontSize='30px' />}
          bg='transparent'
          color={selectedView === 'background' ? colors.brand.primary : iconColor}
          _hover={{
            cursor: 'pointer',
            color: colors.brand.primary
          }}
          onClick={() => setSelectedView('background')}
        />
      </Tooltip>
      {/* <Tooltip label='Change your voice'>
        <IconButton 
          aria-label='Voice'
          icon={<BiMicrophone fontSize='30px' />}
          bg='transparent'
          color={selectedView === 'voice' ? '#5D5FEF' : 'initial'}
          _hover={{
            cursor: 'pointer',
            color: '#5D5FEF'
          }}
          onClick={() => setSelectedView('voice')}
        />
      </Tooltip> */}
      <Tooltip label='Studio Playground' display={['none', 'initial']}>
        <IconButton 
          aria-label='Studio'
          display={['none', 'initial']}
          icon={<MdOutlineCamera fontSize='30px' />}
          bg='transparent'
          color={selectedView === 'studio' ? colors.brand.primary : iconColor}
          _hover={{
            cursor: 'pointer',
            color: colors.brand.primary
          }}
          pl='6px'
          onClick={() => setSelectedView('studio')}
        />
      </Tooltip>
    </Stack>
  );
};

export default StudioToolbar;