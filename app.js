var serveStatic = require('serve-static');
var server = require('./server/server')();
var sockets = require('./sockets/sockets');

server.set('views', './dist');
server.use(serveStatic('dist', {
    'index': ['index.html']
}));

sockets(server);

server.listen(server.get('port'), function () {
    console.log('✔ Express server listening connected listening on: ' +server.get('port'));
});