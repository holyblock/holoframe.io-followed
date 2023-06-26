import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HologramStudio, NFTMetadata } from '../.';

const App = () => {
  const darkmodeEnabled = true;
  // Deserialize JSON array into NFTMetadata array type
  const assets: any[] = [
    {
      "name": "CoolCats-407",
      "project": "coolcats",
      "description": "Cool Cat #407, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/coolcat407.zip",
      "image": "https://arweave.net/b6ALccGZGpTAW0ZyMy75BHCMDLIBKRd9CaMig4pYdsw"
    },
    {
      "name": "Doodles-3590",
      "project": "doodles",
      "description": "Doodles #3590, but alive!",
      "type": "live2d",
      "format": "live2d",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/doodle3590.zip",
      "image": "https://lh3.googleusercontent.com/mZicy0WsDh52Abt43Z_NVqpjhZ03E29GGm22IEf3hiigtbyO1E5wKNVAXLB-PMDBYDiZ-uV4uOktQNxTQomU8KVzdYMftcHg5jDfoQ=w600"
    },
    {
      "name": "Anata",
      "description": "A test Live2D model for Hologram",
      "type": "live2d",
      "model_url": "https://rolling-filters.s3.amazonaws.com/live2d/anata-female/0.zip",
      "image": "https://rolling-filters.s3.amazonaws.com/images/anata_female_0.png",
      "format": undefined
    },
    {
      "name": "Holo",
      "description": "A test VRM model for Hologram",
      "type": "3d",
      "format": "vrm",
      "model_url": "https://rolling-filters.s3.amazonaws.com/3d/holo.vrm",
      "image": "https://rolling-filters.s3.amazonaws.com/images/holo.png",
    }
  ];
  const backgrounds: NFTMetadata[] = [
    {
      name: 'Anime Background 1',
      description: 'An anime background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background1.png'
    },
    {
      name: 'Anime Background 2',
      description: 'A cyberpunk anime background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background2.jpg'
    },
    {
      name: 'Retro Background 1',
      description: 'A retro background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/Background3.jpg'
    },
    {
      name: 'Retro Background 2',
      description: 'A retro background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background4.jpeg'
    },
    {
      name: 'ETH Background',
      description: 'Ethereum background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background5.jpg'
    },
    {
      name: 'Gainzy Background',
      description: 'Gainzy background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background6.jpeg'
    },
    {
      name: 'Pepe Background',
      description: 'Pepe background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background7.jpg'
    },
    {
      name: 'Pepe Background 2',
      description: 'Pepe background 2',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background9.jpg'
    },
    {
      name: 'Chamath Background',
      description: 'Chamath background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background8.jpg'
    },
    {
      name: 'Wotjek Background',
      description: 'Wotjek background',
      image: 'https://hologramxyz.s3.amazonaws.com/backgrounds/background11.jpg'
    },
  ];

  return (
    <div style={{ backgroundColor: darkmodeEnabled ? 'black' : 'white', width: '100vw', height: '100vh'}}>
      <HologramStudio
        apiKey={'iuw27ggiwnyvfs6flhcctw65ef2e5cdhmaab223xu6fyc6xw5obh3ei'} 
        nftMetadataList={assets} 
        backgroundList={backgrounds}
        toolbarEnabled 
        // fullscreenEnabled
        uploadEnabled
        darkmodeEnabled={darkmodeEnabled}
        trackingMode='face'
        defaultBackgroundURL='https://hologramxyz.s3.amazonaws.com/backgrounds/background1.png'
        defaultModelSize={1.2}
        // disableLoadingScreen
        mixpanelToken='f002de684aee49e4fe3678d5f7baeef7'
        userAddresss='0x5e765C6A318502FF2F6eF0D951e84F8dAE7FA3c9'
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
