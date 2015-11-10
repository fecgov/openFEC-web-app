/* global process */

var istanbul = require('browserify-istanbul');

module.exports = function(config) {
  var browserify = {
    debug: true,
    transform: ['hbsfy']
  };

  var reporters = ['progress'];

  if (process.argv.indexOf('--debug') === -1) {
    browserify.transform.push(istanbul({
      ignore: [
        'tests/unit/**/*',
        '**/templates/**'
      ]}
    ));
    reporters.push('coverage');
  }

  config.set({
    frameworks: ['browserify', 'phantomjs-shim', 'mocha', 'chai-sinon'],

    files: [
      'tests/unit/**/*.js',
      'static/js/pages/**/*.js',
      'static/js/modules/**/*.js'
    ],

    preprocessors: {
      'tests/unit/**/*.js': ['browserify'],
      'static/js/pages/**/*.js': ['browserify'],
      'static/js/modules/**/*.js': ['browserify']
    },

    browserify: browserify,

    coverageReporter: {
      subdir: '.',
      reporters: [
        {type: 'html'},
        {type: 'text'},
        {type: 'json', file: 'coverage.json'}
      ]
    },

    reporters: reporters,
    browsers: ['Chrome'],
    port: 9876
  });
};
