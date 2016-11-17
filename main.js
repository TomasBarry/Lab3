// Import node socket module, command handler and custom logger
const net = require('net');
const handler = require('./request-handler.js');
const logger = require('./logger.js');
const util = require('util');


// used to keep track of connected clients 
var clients = {};


// create the Node server and wait for socket connections
var server = net.createServer((socket) => {
	logger.log('info', 'New socket connection');
	
	// store the client socket
	socket.key = socket.remoteAddress + ":" + socket.remotePort;
	clients[socket.key] = socket;

	socket.on('data', (data) => {
		logger.log('info', 'Socket(' + socket.key + ') data: ' + data.toString());
		handler.handleData(data.toString());
	});
	socket.on('close', () => {
		delete clients[socket.key];
		logger.log('info', 'Deleted client. Clients: ' + Object.keys(clients).length);	
	});	
});


// Event handler for if the server encounters an error
server.on('error', (err) => {
	logger.log('err', 'server error');
});


// Start server to listen on a specific port
server.listen(8000, () => {
	logger.log('info', 'opened server on ' + util.inspect(server.address()));
});
