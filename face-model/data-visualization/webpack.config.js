const path = require('path');

module.exports = {
  entry: {
    data: ['./src/data.js'],
    model: ['./src/model.js'],
    simulation: ['./src/simulation.js'],
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  devtool: "source-map"
};
