const gulp = require("gulp");
const minify = require("gulp-minify");
const concat = require('gulp-concat');

function minifyJs() {
    return gulp.src(['src/engine.all.min.js','src/game.js'])
    .pipe(minify({noSource: true}))
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'))
}

function moveAssets() {
    return gulp.src(['assets/images/tiles.png'])
    .pipe(gulp.dest('dist/assets/images'))
}

gulp.task('dist', gulp.series(minifyJs,moveAssets));