const path = require('path');

module.exports = {
  entry: './src/index.ts',
  
  mode: 'development',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  
  resolve: {
    extensions: ['.ts', '.js'],
  },
  // loaders
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  }
}