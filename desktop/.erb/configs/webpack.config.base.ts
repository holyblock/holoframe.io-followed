/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    fallback: {
      crypto: false,
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
      assert: false,
      util: false,
      http: false,
      https: false,
      os: false,
      path: require.resolve('path-browserify'),
      fs: false,
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      MORALIS_APP_ID: 'QSr4K3SoZF2W4NgJm2jfVgtsovGcKowzu2ly3Vzl',
      MORALIS_SERVER_URL: 'https://s6uskfuor3bl.usemoralis.com:2053/server',
      MIXPANEL_PROJECT_TOKEN: '7496dc17d1cd129e3a188c607f4421cf',
      ALTER_API_KEY: 'iuw27ggiwnyvfs6flhcctw65ef2e5cdhmaab223xu6fyc6xw5obh3ei',
      AUTH_TOKEN_KEY: 'rollingai21',
      ALCHEMY_API_KEY: 'qHHzGW_iprDZ3Bar9Zxeov6DXilnpZ89',
      FIREBASE_API_KEY: 'AIzaSyBmiV_Y6gzUeTSY278tc1tllCRL72_1Jj4',
      FIREBASE_AUTH_DOMAIN: 'hologram-creator-studio.firebaseapp.com',
      FIREBASE_PROJECT_ID: 'hologram-creator-studio',
      FIREBASE_STORAGE_BUCKET: 'hologram-creator-studio.appspot.com',
      FIREBASE_MESSAGING_SENDER_ID: '51178068491',
      FIREBASE_APP_ID: '1:51178068491:web:243d0466bc2c23a77f050e',
    }),
  ],
};

export default configuration;
