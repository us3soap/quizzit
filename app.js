var serveStatic = require('serve-static');
var http = require('http');
var app = require('./server/server')();
var sockets = require('./server/sockets/sockets');

app.set('views', './dist');
app.use(serveStatic('dist', {
    'index': ['index.html']
}));

var server = http.createServer(app);
var io = require('socket.io').listen(server);

sockets(io);

server.listen(app.get('port'), function () {
    console.log('✔ Express server listening connected listening on: ' + app.get('port'));
});