var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var minify = require('gulp-minify');

gulp.task('bower', function() {
    return gulp.src(mainBowerFiles(), { base: 'bower_components' })
        .pipe(minify())
        .pipe(gulp.dest('dist/bower_components'))
});