var gulp = require('gulp');
var minify = require('gulp-minify');

gulp.task('compress', function() {

  gulp.src('app/js/*.js')
    .pipe(minify({
        ext:{
            min:'.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('dist/js'))
});