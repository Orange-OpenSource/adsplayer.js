// Requis
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

// Variables de chemins
var source = '../src'; // dossier de travail
var destination = '../dist'; // dossier à livrer

 
gulp.task('lint', function() {
  return gulp.src(source+'/*/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});
 
gulp.task('compress', function() {
  return gulp.src(source+'/*/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(destination));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, [destination], {
    dot: true,
	force: true
}));