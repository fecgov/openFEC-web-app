/* global require, process */

var _ = require('underscore');

var browserify = require('browserify');

var gulp = require('gulp');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var preprocessify = require('preprocessify');
var stringify = require('stringify');
var hbsfy = require('hbsfy');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var appEnv = require('cfenv').getAppEnv();


var debug = !!process.env.FEC_WEB_DEBUG;
var analytics = !!process.env.FEC_WEB_GOOGLE_ANALYTICS;
var production = ['stage', 'prod'].indexOf(process.env.FEC_WEB_ENVIRONMENT) !== -1;

gulp.task('copy-vendor-images', function() {
  return gulp.src('./node_modules/datatables/media/images/**/*')
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('copy-images', function() {
  return gulp.src(['./static/img/**/*', './node_modules/fec-style/img/**/*'])
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('copy-maps', function() {
  return gulp.src('./node_modules/congressional-districts/**/*')
    .pipe(gulp.dest('./dist/json/districts'));
});

gulp.task('build-sass', ['copy-vendor-images', 'copy-images', 'copy-maps'], function() {
  return gulp.src('./static/styles/*.scss')
    .pipe(rename(function(path) {
      path.dirname = './dist/styles';
    }))
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass({
      includePaths: Array.prototype.concat(
        './static/styles',
        'node_modules'
      )
    }).on('error', sass.logError))
    .pipe(rev())
    .pipe(gulpif(!production, sourcemaps.write()))
    .pipe(gulpif(production, minifyCss()))
    .pipe(gulp.dest('.'))
    .pipe(rev.manifest({merge: true}))
    .pipe(gulp.dest('.'));
});

gulp.task('watch-sass', function() {
  gulp.watch('./static/styles/**/*.scss', ['build-sass']);
});

var fs = require('fs');
var path = require('path');
var file = require('gulp-file');
var concat = require('concat-stream');
var factor = require('factor-bundle');

var del = require('del');
var extend = require('gulp-extend');
var vinylPaths = require('vinyl-paths');

function merge() {
  return gulp.src(['./rev-manifest.json', './dist/js/**/*.json'])
    .pipe(vinylPaths(del))
    .pipe(extend('rev-manifest.json', true, 2))
    .pipe(gulp.dest('.'));
}

var count = 0;
function write(streams, name) {
  var dest = name.replace(/static/, 'dist');
  return concat(function(body) {
    return file(dest, body, {src: true})
      .pipe(rev())
      .pipe(gulpif(production, uglify()))
      .pipe(gulp.dest('.'))
      .pipe(rev.manifest({
        path: dest
          .replace(new RegExp(path.extname(name) + '$'), '.json')
        }))
      .pipe(gulp.dest('.'))
      .on('end', function() {
        if (++count >= streams) {
          merge();
        }
      });
  });
}

gulp.task('build-js', function() {
  var pages = _(fs.readdirSync('./static/js/pages'))
    .chain()
    .filter(function(filename) {
      return /.js$/.test(filename);
    })
    .map(function(each) {
      return path.join('./static/js/pages', each);
    })
    .value();
  pages.unshift('static/js/init.js');
  var callback = write.bind(undefined, pages.length + 1);
  count = 0;
  return browserify({
    entries: pages,
    plugin: [['factor-bundle', {outputs: _.map(pages, callback)}]],
    opts: {global: true},
    debug: debug
  })
  .transform(preprocessify({
    DEBUG: debug,
    ANALYTICS: analytics
  }))
  .transform({global: true}, stringify(['.html']))
  .transform({global: true}, hbsfy)
  .bundle()
  .pipe(callback('static/js/common.js'));
});
