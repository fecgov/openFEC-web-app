/* global require */

var _ = require('underscore');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var watchify = require('watchify');
var browserify = require('browserify');

var gulp = require('gulp');
var rev = require('gulp-rev');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var sass = require('gulp-ruby-sass');

var opts = {
  entries: ['./static/js/init.js'],
  debug: true
};
var watchOpts = _.assign({}, watchify.args, opts);
var b = browserify(opts);
var wb = watchify(browserify(watchOpts));

function bundle(watch) {
  return (watch ? wb : b).bundle()
    .pipe(source('static/js/init.js'))
    .pipe(buffer())
    .pipe(rename('./static/js/app.js'))
    .pipe(rev())
    .pipe(gulp.dest('.'))
    .pipe(rev.manifest({merge: true}))
    .pipe(gulp.dest('.'));
}

wb.on('update', bundle);
wb.on('log', gutil.log);

gulp.task('build', bundle.bind(this, false));
gulp.task('watch', bundle.bind(this, true));

gulp.task('sass-build', function() {
  return sass('./static/styles/styles.scss')
    .pipe(rename('static/styles/styles.css'))
    .pipe(rev())
    .pipe(gulp.dest('.'))
    .pipe(rev.manifest({merge: true}))
    .pipe(gulp.dest('.'));
});

gulp.task('sass-watch', function() {
  gulp.watch('./static/styles/**/*.scss', ['sass-build']);
});
