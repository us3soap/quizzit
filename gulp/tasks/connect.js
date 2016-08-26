var gulp = require('gulp');
var connectLiveReload = require('connect-livereload');
var serveStatic = require('serve-static');
var app = require('../../server/server')();
var http = require('http');
var sockets = require('../../server/sockets/sockets');


gulp.task('connect', ['styles', 'fonts'], function() {
    app.set('views', './app');

    app.use(connectLiveReload())
        .use(serveStatic('.tmp'))
        .use(serveStatic('app', {
            'index': ['index.html'],
        }))
        // paths to bower_components should be relative to the current file
        // e.g. in app/index.html you should use ../bower_components
        .use('/bower_components', serveStatic('bower_components'));
    
    var server = http.createServer(app);
    var io = require('socket.io').listen(server);
    sockets(io);

    server.listen(app.get('port'), function () {
        console.log('✔ Express server listening connected listening on: ' + app.get('port'));
        console.log('✔ Socket.io listening connected listening on: ' + app.get('port'));
    });
});

gulp.task('connect:dist', ['build'], function() {
    app.set('views', './dist');

    app.use(serveStatic('dist', {
        'index': ['index.html']
    }));
    
    var server = http.createServer(app);
    var io = require('socket.io').listen(server);
    sockets(io);

    server.listen(app.get('port'), function () {
        console.log('✔ Express server listening connected listening on: ' + app.get('port'));
        console.log('✔ Socket.io listening connected listening on: ' + app.get('port'));
    });
})