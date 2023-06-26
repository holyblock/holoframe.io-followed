const config = {
  chain: {
    supportedIDs: [1, 5],
  },
  extension: {
    platforms: {
      supportedUrls: [
        "discord.com",
        "meet.google.com",
        "gather.town",
        "slack.com",
        "teams.live.com",
        "restream.io",
      ],
    },
  },
  desktop: {
    vcam: {
      dir: {
        windows: "C:\\hologram",
        mac: "/tmp",
      },
      file: {
        temp: "holotmp.bmp",
        final: "holocam.bmp",
      },
    },
    scene: {
      supportedMimeTypes: [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/gif",
        "video/mp4",
        "video/ogg",
        "video/webm",
        "application/octet-stream",
        "video/quicktime",
        "audio/mpeg",
      ],
      supportedImageMimeTypes: ["image/png", "image/jpg", "image/jpeg"],
      supportedVideoMimeTypes: [
        "video/mp4",
        "video/ogg",
        "video/webm",
        "application/octet-stream",
        "video/quicktime",
      ],
      supportedSoundMimeTypes: ["audio/mpeg"],
      supportedGifMimeTypes: ["image/gif"],
    },
  },
  web: {
    download: {
      mac: {
        apple:
          "https://hologramxyz.s3.amazonaws.com/build/desktop/Hologram+Beta+(m1-v0.1.16).pkg",
        intel:
          "https://hologramxyz.s3.amazonaws.com/build/desktop/Hologram+Beta+(x64-v0.1.15).pkg",
      },
      windows:
        "https://hologramxyz.s3.amazonaws.com/build/desktop/windows/Hologram+Setup+0.1.16.exe",
    },
    studio: {
      whitelist: {
        creators: [
          "0x5e765C6A318502FF2F6eF0D951e84F8dAE7FA3c9",
          "0x13bE1718B1a76fD96F6e20cFEB754770BAFE88FE",
          "0x7949Ae9C02a8815Abb876f93B0B3fD8F076055bd",
          "0xB0B4630E7612be7d3C3C60e5E623479FF79Eb9C7",
          "0x953bdA11C8234EDa3b72f161c5bb1a689142246C",
          "0x88c91CefDC1A6c486b350Bd28D10d3ED4330055B",
          "0x98F97B3fC1A536E25A0f1839D0Eb9ff685041548", // Hongzi burner
          "0x7936313FF5Cf775a435B07931C8588Eb99059967",
          "0xC32D2c2797C8D340c71D7108daa2BB148ed364b6", // Slayed
          "0x46aDbA6D75d5cAeE81fA0466e88Da7EDF9651Bfa", // R1B
        ],
      },
    },
  },
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
      // Pudgy Penguins
      PPG: {
        type: "3d",
        format: "glb",
        version: "v1",
        needClaim: true, // We need to verify whether holder claimed
      }
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
    supported: {
      zip: "live2d",
      vrm: "3d",
      glb: "3d",
    },
    supportedTypes: ["live2d", "3d"],
    fetchTimeInMS: 750,
  },
  video: {
    videoWidth: 1280,
    videoHeight: 720,
    ratio: 9 / 16,
    widths: {
      sm: 480,
      md: 768,
      lg: 992,
      xl: 1200,
    },
  },
  camera: {
    mobileWidth: 640,
    mobileHeight: 480,
    safariWidth: 640,
    safariHeight: 480,
  },
  assets: {
    defaultBackground: "https://hologramxyz.s3.amazonaws.com/background.png",
    defaultBackgroundDark:
      "https://hologramxyz.s3.amazonaws.com/background-dark.png",
    placeholder: "https://hologramxyz.s3.amazonaws.com/placeholder.png",
    holo: "https://hologramxyz.s3.amazonaws.com/holo.png",
    loadingDark: "https://hologramxyz.s3.amazonaws.com/loadingDark.png",
    loadingLight: "https://hologramxyz.s3.amazonaws.com/loadingLight.png",
    faceModel: "https://hologramxyz.s3.amazonaws.com/nn",
    partnershipAssets: "https://hologramxyz.s3.amazonaws.com/partnerships",
    mascots: "https://hologramxyz.s3.amazonaws.com/mascots",
    featured: "https://hologramxyz.s3.amazonaws.com/marketing/featured.json",
  },
  apiUrl: "https://api.hologram.xyz",
  wssUrl: "wss://api.hologram.xyz",
};

export default config;
