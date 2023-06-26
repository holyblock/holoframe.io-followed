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
    supportedTypes: ["live2d", "3d"],
    fetchTimeInMS: 750,
  },
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
  assets: {
    partnershipAssets: "https://hologramxyz.s3.amazonaws.com/partnerships",
  },
  apiUrl: "https://api.hologram.xyz",
  wssUrl: "wss://api.hologram.xyz",
};

export default constants;
