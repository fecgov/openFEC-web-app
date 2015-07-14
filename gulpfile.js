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
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var preprocessify = require('preprocessify');

var debug = !!process.env.FEC_WEB_DEBUG;
var production = !!process.env.FEC_WEB_PRODUCTION;

var opts = {
  entries: ['./static/js/init.js'],
  debug: debug
};
var watchOpts = _.assign({}, watchify.args, opts);
var b = browserify(opts);
var wb = watchify(browserify(watchOpts));

function bundle(watch) {
  return (watch ? wb : b)
    .transform(preprocessify({DEBUG: debug}))
    .bundle()
    .pipe(source('static/js/init.js'))
    .pipe(buffer())
    .pipe(rename('./static/js/app.js'))
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

var path = require('path');
var file = require('gulp-file');
var concat = require('concat-stream');
var factor = require('factor-bundle');

function write(name) {
  return concat(function(body) {
    return file(path.basename(name), body, {src: true})
      .pipe(rev())
      .pipe(gulp.dest('./bundle'))
      .pipe(rev.manifest({
        path: path.basename(name)
          .replace(new RegExp(path.extname(name) + '$'), '.json')
        }))
      .pipe(gulp.dest('./bundle'));
  });
}

gulp.task('factor', function() {
  return browserify({
    entries: ['./static/js/pages/candidates.js', './static/js/pages/committees.js'],
    plugin: [
      ['factor-bundle', {outputs: [write('candidates.js'), write('committees.js')]}]
    ],
    debug: true
  })
  .bundle()
  .pipe(write('common.js'));
});

var extend = require('gulp-extend');

gulp.task('merge', function() {
  return gulp.src('./bundle/*.json')
    .pipe(extend('rev-manifest.json', true, 2))
    .pipe(gulp.dest('.'));
});
