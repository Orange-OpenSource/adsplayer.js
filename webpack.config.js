'use strict'

var webpack = require('webpack');
var path = require('path');
var argv = require('yargs').argv;
var pkg = require("./package.json");

var TypedocWebpackPlugin = require('typedoc-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var ouptutname = 'adsplayer';

var commitDate = require('child_process')
  .execSync('git log -1 --format=%cD')
  .toString();

console.log(commitDate);
var date = new Date(commitDate);
var gitDate = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
console.log(gitDate);

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
    })
  ]
};