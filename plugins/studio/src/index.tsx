import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Studio from './components/Studio';
import { NFTMetadata } from './types';
import { theme } from './styles/theme';
import { Fonts } from './styles/Fonts';
import { AuthProvider } from './contexts/AuthContext'; 
import { StyleProvider } from './contexts/StyleContext';
import './styles/globals.css';
import { SettingProvider } from './contexts/SettingContext';
import mixpanel from 'mixpanel-browser';
import { NFTProvider } from './contexts/NFTContext';

export interface HologramStudioProps {
  apiKey: string,
  nftMetadataList: NFTMetadata[],
  backgroundList?: NFTMetadata[],
  toolbarEnabled?: boolean,
  uploadEnabled?: boolean,
  darkmodeEnabled?: boolean,
  fullscreenEnabled?: boolean,
  defaultBackgroundURL?: string,
  defaultModelSize?: number,
  trackingMode?: string, // 'face', 'mouse', 'animation', 'none'
  animationSequence?: any, // only applies when trackingMode is 'animation'
  selectDisplayMode?: string, // 'grid', 'carousel'
  selectedAvatarIndex?: number, // default: 0
  size?: string, // 'sm', 'md', 'lg'
  disableBannerKey?: string,
  disableLoadingScreen?: boolean,
  theme?: any // Chakra UI theme,
  mixpanelToken?: string,
  userAddresss?: string
}

export const HologramStudio = (props: HologramStudioProps) => {
  useEffect(() => {
    if (props.mixpanelToken) {
      mixpanel.init(props.mixpanelToken, { ip: false });
    }
  }, []);
  return (
    <ChakraProvider theme={props.theme ?? theme}>
      <AuthProvider>
        <NFTProvider>
          <StyleProvider>
            <SettingProvider>
              <Fonts />
              <Studio {...props}/>
            </SettingProvider>
          </StyleProvider>
        </NFTProvider>
      </AuthProvider>
    </ChakraProvider>
  );
};

export { NFTMetadata };
