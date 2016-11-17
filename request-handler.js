var chatrooms = require('./chatrooms-json.js');
var logger = require('./logger.js');

const handler = {
	handleData: function(data) {
	if (data.indexOf('JOIN_CHATROOM') === 0) {
		logger.log('info', 'Joining a chatroom');
	}
	else {
		logger.log('warn', 'Unknown command');
	}
    }
};

module.exports = handler;
