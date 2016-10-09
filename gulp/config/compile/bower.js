var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var minify = require('gulp-minify');
var gulpFilter = require('gulp-filter');

gulp.task('bower', function() {
    var filterJS = gulpFilter('**/*.min.js', { restore: true });
    return gulp.src(mainBowerFiles(), { base: 'bower_components' })
        .pipe(gulp.dest('dist/bower_components'))
});