const constants = {
  partners: {
    eth: {
      MIL: {
        version: "v1",
        type: "live2d",
        format: "zip",
      },
      FroyoKitten: {
        version: "v1",
        type: "live2d",
        format: "zip",
      },
      // Chain Runners XR
      XR: {
        type: "3d",
        format: "glb",
        standard: "ETM",
      },
    },
    arbitrum: {
      MITHPFP: {
        version: "v1",
        type: "live2d",
        format: "zip",
      },
    },
  },
  nfts: {
    supportedTypes: ['live2d', '3d']
  },
  video: {
    videoWidth: 1280,
    videoHeight: 720,
    ratio: 9 / 16,
    widths: {
      sm: 480,
      md: 768,
      lg: 992,
      xl: 1200
    }
  },
  camera: {
    mobileWidth: 640,
    mobileHeight: 480,
    safariWidth: 640,
    safariHeight: 480
  },
  assets: {
    defaultBackground: 'https://hologramxyz.s3.amazonaws.com/background.png',
    holo: 'https://hologramxyz.s3.amazonaws.com/holo.png',
    loadingDark: 'https://hologramxyz.s3.amazonaws.com/loadingDark.png',
    loadingLight: 'https://hologramxyz.s3.amazonaws.com/loadingLight.png',
    faceModel: 'https://hologramxyz.s3.amazonaws.com/nn'
  },
  apiUrl: "https://api.hologram.xyz",
  wsUrl: "ws://api.hologram.xyz/",
};

export default constants;