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

// gulp.task('build-js', bundle.bind(this, false));
gulp.task('watch-js', bundle.bind(this, true));

gulp.task('copy-vendor-images', function() {
  return gulp.src('./node_modules/datatables/media/images/**/*')
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('copy-fonts', function() {
  return gulp.src('./static/fonts/**/*')
  .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('copy-images', function() {
  return gulp.src('./static/img/**/*')
  .pipe(gulp.dest('./dist/img'));
});

gulp.task('build-sass', ['copy-vendor-images', 'copy-fonts', 'copy-images'], function() {
  return gulp.src('./static/styles/styles.scss')
    .pipe(rename('dist/styles/styles.css'))
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

gulp.task('factor', function() {
  var pages = fs.readdirSync('./static/js/pages').map(function(each) {
    return path.join('./static/js/pages', each);
  });
  pages.unshift('static/js/init.js');
  var callback = write.bind(undefined, pages.length + 1);
  count = 0;
  return browserify({
    entries: pages,
    plugin: [['factor-bundle', {outputs: _.map(pages, callback)}]],
    debug: true
  })
  .transform(preprocessify({DEBUG: debug}))
  .bundle()
  .pipe(callback('static/js/common.js'));
});
