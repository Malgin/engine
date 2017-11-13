const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devtool: 'eval',
  devServer: {
    contentBase: path.join(__dirname, 'src'),
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
      },
      {
        test: /\.mdl$/,
        use: 'file-loader?name=/resources/[name].[ext]'
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
    // new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([{
        from: 'resources/**/*.mdl', // copy models into resources folder
        to: '.'
      }]),
    new CopyWebpackPlugin([{
      from: 'resources/**/*.jpg',
      to: '.'
    }])
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};