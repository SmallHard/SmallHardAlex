"use strict";

const gulp = require('gulp');
const sass = require('gulp-sass');
const del = require('del');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const compileHandlebars = require('gulp-compile-handlebars');
const trim = require('gulp-trim');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('clean',
    del.bind(null, ['./.tmp'], {dot: true})
);

gulp.task('serve', function () {
  browserSync.init({
    notify: false,
    logPrefix: 'WSK',
    logFileChanges: false,
    server: ['./.tmp'],
    startPath: '/html/',
    logSnippet: false
  });
});

gulp.task('sass', function () {
  return gulp.src('./src/sass/main.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: ['last 10 versions'],
        cascade: 1
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./.tmp/css'))
      .pipe(browserSync.stream());
});

gulp.task('html', function () {
  const data = {
        j_title: ''
      },
      options = {
        ignorePartials: true,
        batch: [
          './src/html/layouts',
          './src/html/partials'
        ],
        helpers: {
          times: function (n, block) {
            var accum = '';
            for (var i = 0; i < n; ++i)
              accum += block.fn(i + 1);
            return accum;
          },
          ifCond: function (v1, v2, options) {
            if (v1 === v2) {
              return options.fn(this);
            }
            return options.inverse(this);
          }
        }
      };

  return gulp.src([
    './src/html/**/*.hbs',
    '!./src/html/layouts/**/*.hbs',
    '!./src/html/partials/**/*.hbs'
  ])
      .pipe(plumber())
      .pipe(compileHandlebars(data, options))
      .pipe(rename(path => {
        path.extname = ".html"
      }))
      .pipe(trim())
      .pipe(gulp.dest('./.tmp/html'))
      .pipe(browserSync.stream());
});

gulp.task('public', function () {
  return gulp.src('./.tmp/**/*').pipe(gulp.dest('./public'));
});

gulp.task('watch', function () {
  gulp.watch(['./src/sass/**/*.scss'], gulp.series('sass'));
  gulp.watch(['./src/html/**/*'], gulp.series('html'));
  gulp.watch(['./src/img/**/*'], gulp.series('copy-img'));
  gulp.watch(['./src/fonts/**/*'], gulp.series('copy-fonts'));
});

gulp.task('copy-img', function () {
    return gulp.src('./src/img/**/*')
        .pipe(gulp.dest('./public/img'))
        .pipe(gulp.dest('./.tmp/img'))
});

gulp.task('copy-fonts', function () {
    return gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./public/fonts'))
        .pipe(gulp.dest('./.tmp/fonts'))
});
gulp.task('copy-js', function () {
    return gulp.src('./src/js/**/*')
        .pipe(gulp.dest('./public/js'))
        .pipe(gulp.dest('./.tmp/js'))
});

gulp.task('start', gulp.series(
    gulp.parallel('clean'),
    gulp.parallel('sass', 'html', 'copy-img', 'copy-fonts', 'copy-js'),
    gulp.parallel('watch', 'serve')
));

gulp.task('build', gulp.series(
    gulp.parallel('clean'),
    gulp.parallel('sass', 'html', 'copy-img', 'copy-fonts'),
    gulp.parallel('public')
));