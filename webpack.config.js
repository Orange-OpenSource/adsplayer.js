'use strict'

var webpack = require('webpack');
var pkg = require("./package.json");

var TypedocWebpackPlugin = require('typedoc-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ZipPlugin = require('zip-webpack-plugin');

var ouptutname = 'adsplayer.js';

var commitDate = require('child_process')
  .execSync('git log -1 --format=%cD')
  .toString();

var date = new Date(commitDate);
var gitDate = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + (date.getDate());

module.exports = {
  entry: __dirname + '/index.ts',
  devtool: 'eval-source-map',
  output: {
    path: __dirname + '/dist',
    filename: ouptutname,
    library: 'adsplayer',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: ['babel'],
        exclude: /(node_modules)/
      },
      {
        test: /\.ts$/,
        loader: ['ts-loader'],
        exclude: /node_module/
      }

    ]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  watchOptions: {
    ignored: /node_modules/
  },
  performance: {
    hints: false
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
      __BUILDDATE__: JSON.stringify(gitDate)
    }),
    new CopyWebpackPlugin([{
      from: './index.html',
      transform: function (content, toto) {
        content = content.toString()
          .replace(new RegExp('@@VERSION', 'g'), pkg.version)
          .replace('@@DATE', gitDate);

        return content;
      }
    }]),
    new CopyWebpackPlugin([
      './package.json',
      './README.md',
      './CHANGELOG.md',
      './COPYRIGHT'
    ]),
    new TypedocWebpackPlugin({
      name: 'adsplayer.js',
      out: './doc',
      module: 'commonjs',
      target: 'es6',
      mode: 'module',
      exclude: [
        '**/node_modules/**/*.*',
        '**/src/lib/**/*.*'
      ],
      experimentalDecorators: true,
      includeDeclarations: false,
      excludeExternals: true,
      excludeNotExported: true,
      excludePrivate: true,
      ignoreCompilerErrors: true
    }),
    new ZipPlugin({
      filename: ouptutname + '-v' + pkg.version + '.zip',
    })
  ]
};
