const gulp = require("gulp");
const minify = require("gulp-minify");
const concat = require('gulp-concat');
const zip = require('gulp-zip');
const advzip = require('gulp-advzip');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;
const terser = require('gulp-terser');

/*
function minifyJs() {
    return gulp.src(['src/engine.all.min.js','src/game.js'])
    .pipe(minify({noSource: true}))
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'))
}
*/
function uglifyJS() {
    return gulp.src('./src/engine.all.min.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
  }



/*
function es(){
  return gulp.src('./src/engine.all.min.js')
    .pipe(terser({
        keep_fnames: true,
      mangle: false
    }))
    .pipe(gulp.dest('./build'));
}
*/
/*
function moveAssets() {
    return gulp.src(['assets/images/tiles.png'])
    .pipe(gulp.dest('dist/assets/images'))
}
*/
function zipDist() {
    return gulp.src(['dist/**/*'])
    .pipe(zip('archive.zip'))
    .pipe(advzip())
    .pipe(gulp.dest('out'));
}

gulp.task('dist', gulp.series(uglifyJS));

