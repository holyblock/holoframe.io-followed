const projectConfig = {
  readyplayerme: {
    camera: { posZ: 0.48, lookY: 0.3 },
    rotation: { body: { x: 0.7 } },
  },
  XR: {
    rotation: {
      neck: {
        x: 0.2,
      },
    },
    blendshapes: {
      neck: {
        order: ['Z', 'Y', '-X'],
      },
    },
  },
};

export { projectConfig };
