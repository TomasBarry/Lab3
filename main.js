// Import node socket module, command handler and custom logger
const net = require('net');
const handler = require('./request-handler.js');
const logger = require('./logger.js');
const util = require('util');


const serverAddress = '10.62.0.117';
const serverPort = '8000';
const studentNumber = '13321218';


// used to keep track of connected clients 
var clients = {};


// create the Node server and wait for socket connections
var server = net.createServer((socket) => {
	socket.key = socket.remoteAddress + ":" + socket.remotePort;	
	
	socket.on('data', (data) => {
		let message = data.toString();
		logger.log('info', socket.key + ' - data: ' + message);
		if (message.indexOf('HELO') === 0) {
			handler.helo(socket, message, serverAddress, serverPort, studentNumber);
		}
		else if (message.indexOf('JOIN_CHATROOM') === 0) {
			handler.join_chatroom(socket, message, serverAddress, serverPort);
		}
		else if (message.indexOf('LEAVE_CHATROOM') === 0) {
			handler.leave_chatroom(socket, message);
		}
		else if (message.indexOf('KILL_SERVICE') === 0) {
			handler.kill_service(socket);
		}
		else {
			handler.unknown_command();
		}
	});
	socket.on('close', (had_error) => {
		delete clients[socket.key];
		logger.log('info', 'Deleted client: ' + socket.key);
		logger.log('info', 'Had error? ' + had_error);	
	});
	socket.on('error', (err) => {
		logger.log('error', err);
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
