// Import the chatroom object and custom logger
var chatrooms = require('./chatrooms-json.js');
const logger = require('./logger.js');


// This object will be exported. It handles all incoming requests to the server
const handler = {

	handleData: function(socket, data) {
	if (data.indexOf('JOIN_CHATROOM') === 0) {
		logger.log('info', socket.key + ' is attempting to join a chatroom');
	}
	else if (data.indexOf('LEAVE_CHATROOM') === 0) {
		logger.log('info', socket.key + ' is attempting to leave a chatroom');
	}
	else if(data.indexOf('DISCONNECT') === 0) {
		logger.log('info', socket.key + ' is attempting to disconnect');
	}
	else if(data.indexOf('CHAT') === 0) {
		logger.log('info', socket.key + ' is attempting to chat');
	}
	else {
		logger.log('warn', 'Unknown command');
	}
    }
};

module.exports = handler;
