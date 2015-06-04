/* global require */

var _ = require('underscore');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var watchify = require('watchify');
var browserify = require('browserify');

var gulp = require('gulp');
var rev = require('gulp-rev');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var preprocess = require('gulp-preprocess');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

var production = !!process.env.PRODUCTION,
    debug = !!process.env.FEC_WEB_DEBUG;

var opts = {
  entries: ['./static/js/init.js'],
  debug: false
};
var watchOpts = _.assign({}, watchify.args, opts);
var b = browserify(opts);
var wb = watchify(browserify(watchOpts));

function bundle(watch) {
  return (watch ? wb : b).bundle()
    .pipe(source('static/js/init.js'))
    .pipe(buffer())
    .pipe(rename('./static/js/app.js'))
    .pipe(preprocess({context: {W_DEBUG: debug}}))
    .pipe(rev())
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest('.'))
    .pipe(rev.manifest({merge: true}))
    .pipe(gulp.dest('.'));
}

wb.on('update', bundle);
wb.on('log', gutil.log);

gulp.task('build-js', bundle.bind(this, false));
gulp.task('watch-js', bundle.bind(this, true));

gulp.task('copy-static', function() {
  return gulp.src([
    './node_modules/datatables/media/images/*'
  ]).pipe(gulp.dest('./static/images'));
});

gulp.task('build-sass', ['copy-static'], function() {
  return gulp.src('./static/styles/styles.scss')
    .pipe(rename('static/styles/styles.css'))
    .pipe(sass({
      includePaths: Array.prototype.concat(
        './static/styles',
        require('node-bourbon').includePaths,
        require('node-neat').includePaths,
        'node_modules'
      )
    }).on('error', sass.logError))
    .pipe(rev())
    .pipe(gulpif(production, minifyCss()))
    .pipe(gulp.dest('.'))
    .pipe(rev.manifest({merge: true}))
    .pipe(gulp.dest('.'));
});

gulp.task('watch-sass', function() {
  gulp.watch('./static/styles/**/*.scss', ['build-sass']);
});
