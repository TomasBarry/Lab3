var net = require('net');
var handler = require('./request-handler.js');
var logger = require('./logger.js');

var server = net.createServer((socket) => {
	logger.log('info', 'New socket connection');
	socket.on('data', (data) => {
		logger.log('info', data.toString());
		handler.handleData(data.toString());
	});	
});

server.on('error', (err) => {
	// handle errors here
	logger.log('err', 'server error');
});
// grab a random port.
server.listen(8000, () => {
	logger.log('info', 'opened server on ' + server.address());
});
