/* global __dirname */

var path = require('path');
var webpack = require('webpack');
var ManifestPlugin = require('webpack-manifest-plugin');
// var CompressionPlugin = require("compression-webpack-plugin");
var fs = require('fs');

var entries = {
  'init': './static/js/init.js'
};

fs.readdirSync('./static/js/pages').forEach(function(f) {
  var name = f.split('.js')[0];
  var p = path.join('.', '/static/js/pages', f);
  entries[name] = './' + p;
});

module.exports = {
  entry: entries,
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true
    // }),
    new ManifestPlugin({
      fileName: 'rev-manifest.json',
      basePath: 'dist/js/'
    })
  ],
  output: {
    filename: '[name]-[hash].js',
    path: path.resolve(__dirname, 'dist/js')
  },
  module: {
      loaders: [
          {
            test: /\.hbs/,
            loader: "handlebars-template-loader"
          }
      ]
  }
};
