'use strict'

var webpack = require('webpack');
var path = require('path');
var argv = require('yargs').argv;

var TypedocWebpackPlugin = require('typedoc-webpack-plugin');

var ouptutname = 'adsplayer';

module.exports = {
  entry: __dirname + '/index.ts',
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: ouptutname + '.js',
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
      __VERSION__: JSON.stringify(require("./package.json").version)
    }),
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
    })
  ]
};