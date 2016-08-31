var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');

gulp.task('bower', function() {
    return gulp.src(mainBowerFiles(), { base: 'bower_components', filter : '*.js' })
        .pipe(gulp.dest('.tmp/js'))
});