const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devtool: 'eval',
  devServer: {
    contentBase: './dist',
    port: 9000
  },
  module: {
    rules: [
      {
        test: /.js$/,
        loader: 'buble-loader',
        include: path.join(__dirname, 'src'),
        query: {
          objectAssign: 'Object.assign',
          transforms: {
            arrow: true,
            modules: false,
            dangerousForOf: true
          }
        }
      },
      {
        test: /\.shader$/,
        use: 'raw-loader'
      }
    ]
  },
  resolve: {
    alias: {
      resources: path.resolve(__dirname, 'resources/'),
      src: path.resolve(__dirname, 'src/'),
      math$: path.resolve(__dirname, 'src/engine/lib/gl-matrix'),
      engine: path.resolve(__dirname, 'src/engine/')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({title: 'Output Management'}),
    new CleanWebpackPlugin(['dist']),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};