const constants = {
  chain: {
    supportedIDs: [1, 3],
  },
  partners: {
    eth: {
      FroyoKitten: {
        version: "v1",
        type: "live2d",
        format: "zip",
      },
    },
  },
  nfts: {
    supported: {
      zip: "live2d",
      vrm: "3d",
      glb: "3d",
    },
    fetchTimeInMS: 750,
  },
  assets: {
    partnershipAssets: "https://hologramxyz.s3.amazonaws.com/partnerships",
  },
  download: {
    desktop: {
      mac: {
        apple:
          "https://hologramxyz.s3.amazonaws.com/build/desktop/Hologram+Beta+(m1-v0.1.4).pkg",
        intel:
          "https://hologramxyz.s3.amazonaws.com/build/desktop/Hologram+Beta+(x64-v0.1.4).pkg",
      },
      windows:
        "https://hologramxyz.s3.amazonaws.com/build/desktop/windows/Hologram+Setup+0.1.4-win.exe",
    },
  },
  whitelist: {
    creators: [
      "0x5e765C6A318502FF2F6eF0D951e84F8dAE7FA3c9",
      "0x13bE1718B1a76fD96F6e20cFEB754770BAFE88FE",
      "0x7949Ae9C02a8815Abb876f93B0B3fD8F076055bd",
      "0xB0B4630E7612be7d3C3C60e5E623479FF79Eb9C7",
      "0x953bdA11C8234EDa3b72f161c5bb1a689142246C",
      "0x88c91CefDC1A6c486b350Bd28D10d3ED4330055B",
    ],
  },
  apiUrl: "https://api.hologram.xyz",
  wssUrl: "wss://api.hologram.xyz/",
};

export default constants;
