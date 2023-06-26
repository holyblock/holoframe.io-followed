# Hologram Studio Plugin

Hologram powers pseudonymous social interaction and self-expression over video.

This React plugin allows projects partnering and building on top of Hologram to easily showcase their NFT avatars. It enables avatar owners to try out, take selfies, record videos, or stream as their avatars. 

## Overview
The Hologram Studio Plugin is a react component you can use in your React-based web application.

It currently supports Next.js. Support for applications based on other frameworks is coming soon.

## Installation
Using Yarn
```
yarn add @hologramlabs/studio 
```
or using NPM
```
npm install @hologramlabs/studio
```

## Usage (Next.js)
1. Update next.config.js
```
const nextConfig = {
  webpack: (config, options) => {
    config.externals.push({
      fs: 'require("fs")'
    });
    return config
  }
}

module.exports = nextConfig
```

2. Create a wrapper component
```
import { HologramStudio, HologramStudioProps, NFTMetadata, Background } from '@hologramlabs/studio';

const StudioWrapper = (props: HologramStudioProps) => {
  const {
    apiKey,
    nftMetadataList,
    backgroundList,
    toolbarEnabled,
    uploadEnabled
    fullscreenEnabled,
    darkmodeEnabled,
    defaultBackgroundURL,
    trackingMode,
    animationSequence,
    selectDisplayMode,
    selectedAvatarIndex,
    size,
  } = props;

  return (
    <>
      <HologramStudio 
        apiKey={apiKey} 
        nftMetadataList={nftMetadataList} 
        backgroundList={backgroundList}
        toolbarEnabled={toolbarEnabled}
        uploadEnabled={uploadEnabled}
        fullscreenEnabled={fullscreenEnabled}
        darkmodeEnabled={darkmodeEnabled}
        defaultBackgroundURL={defaultBackgroundURL}
        trackingMode={trackingMode}
        animationSequence={animationSequence}
        selectDisplayMode={selectDisplayMode}
        selectedAvatarIndex={selectedAvatarIndex}
        size={size}
      />
    </>
  );
};

export default StudioWrapper;
```

3. Dynamically import wrapper component with SSR turned off
```
const StudioWrapper = dynamic(() => import('<path>/<to>/StudioWrapper'), {
  ssr: false
});

const ExamplePage = (props) => {
  const exampleNFTMetadata = [
    {
      "name": "Example-1",
      "project": "exampleProject",
      "description": "This is an example Live2D NFT metadata",
      "type": "live2d",
      "model_url": "...",
      "image": "..."
    },
    {
      "name": "Example-2",
      "project": "exampleProject",
      "description": "This is an example 3D VRM NFT metadata",
      "type": "3d",
      "format: "vrm",
      "model_url": "...",
      "image": "..."
    },
  ];
  const exampleBackgroundList = [
    {
        "name": "fidenza",
        "description": "A test fidenza",
        "image": "..."
    }
  ];

  return (
    <StudioComponent 
      apiKey={props.apiKey}
      nftMetadataList={exampleNFTMetadata}
      backgroundList={exampleBackgroundList}
      toolbarEnabled
      trackingMode={'face'}
      uploadEnabled
    />
  );
};

export default ExamplePage;
``` 

## Parameters / Types
    * = Required
HologramStudioProps
| Name        | Type           | Description  |
| ------------- |:-------------:| -----|
| apiKey* | string | API key for accessing Hologram Studio |
| nftMetadataList* | NFTMetadata[] | List of NFT metadata objects |
| backgroundList | Background[] | List of static NFTs / backgrounds |
| toolbarEnabled | boolean | Toolbar for selecting NFTs and studio mode|
| trackingMode | string | 'face', 'mouse', 'none'. Default is 'none' |
| uploadEnabled | boolean | Allow import avatar files |
| fullscreenEnabled | boolean | Display canvas as fullscreen by default |
| darkmodeEnabled | boolean | Enable dark mode (white outlines). Default is false. |
| defaultBackgroundURL | string | Image URL of default background |
| defaultModelSize | number | Default is 1 |
| selectDisplayMode | string | 'grid', 'carousel'. Default is 'grid' |
| selectedAvatarIndex | number | Index of initial selected avatar. Default is 0 |
| size | string | 'sm', 'md', 'lg', 'xl'. Default is 'lg' |
| animationSequence | any | Experimental feature. Contact admin for more info |
| mixpanelToken | string | API Token for custom mixpanel instance |
| userAddress | string | ETH address of user (if logged in) |

NFTMetadata
| Name        | Type           | Description  |
| ------------- |:-------------:| -----|
| name*   | string | Unique name of the NFT token |
| project   | string | Name identifier of the collection |
| description | string  | Blurb about the particular NFT |
| type* | string | live2d, 3d |
| format | string | glb, vrm. Only required if “type” field is “3d”|
| model_url | string | An URL to the actual avatar model asset |
| image | string | URL to the image of the item |
| id | string | Unique identifier |