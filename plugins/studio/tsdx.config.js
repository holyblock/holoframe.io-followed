const copy = require('rollup-plugin-copy');
const postcss = require('rollup-plugin-postcss');
const images = require('rollup-plugin-image-files');

// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    config.externals = ['@chakra-ui/react', '@chakra-ui/icons'];
    config.plugins = [
      copy({
        targets: [
          { src: 'public/**/*', dest: 'dist/assets' }
        ]
      }),
      images(),
      postcss(),
      ...config.plugins,
    ]
    return config; // always return a config.
  },
};