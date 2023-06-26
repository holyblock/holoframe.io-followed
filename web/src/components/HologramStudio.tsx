import { HologramStudio, HologramStudioProps, NFTMetadata } from '@hologramlabs/studio';
import previewAssetURIs from '../utils/previewAssetURIs.json';
import previewBackgrounds from '../utils/previewBackgrounds.json';
import { theme } from '../styles/theme';
import { extendTheme } from '@chakra-ui/react';
import { mpToken } from '../../settings';

const Studio = (props: HologramStudioProps) => {
  const {
    apiKey,
    nftMetadataList,
    backgroundList,
    toolbarEnabled,
    uploadEnabled,
    darkmodeEnabled,
    fullscreenEnabled,
    trackingMode,
    selectDisplayMode,
    selectedAvatarIndex,
    size,
    disableBannerKey,
    disableLoadingScreen,
    defaultModelSize,
    defaultBackgroundURL
  } = props;
  let nfts: NFTMetadata[] = previewAssetURIs;
  if (nftMetadataList && nftMetadataList.length > 0) {
    nfts = nftMetadataList;
  }

  let backgrounds: NFTMetadata[] = previewBackgrounds;
  if (backgroundList && backgroundList.length > 0) {
    backgrounds = backgroundList;
  }

  return (
    <>
      <HologramStudio 
        apiKey={apiKey} 
        nftMetadataList={nfts} 
        backgroundList={backgrounds}
        toolbarEnabled={toolbarEnabled}
        uploadEnabled={uploadEnabled}
        fullscreenEnabled={fullscreenEnabled}
        darkmodeEnabled={darkmodeEnabled}
        trackingMode={trackingMode}
        selectDisplayMode={selectDisplayMode}
        selectedAvatarIndex={selectedAvatarIndex}
        size={size}
        disableBannerKey={disableBannerKey}
        defaultModelSize={defaultModelSize}
        defaultBackgroundURL={defaultBackgroundURL}
        disableLoadingScreen={disableLoadingScreen}
        theme={extendTheme(theme)}
        mixpanelToken={mpToken}
      />
    </>
  );
};

export default Studio;