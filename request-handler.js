// Import the chatroom object and custom logger
var chatrooms = require('./chatrooms-json.js');
const logger = require('./logger.js');
const util = require('util');


var serverAddress = "";
var serverPort = "";
var uniqueUserIdentifier = 0;
var uniqueRoomIdentifier = 0;
var roomToRefLookup = {};


function parseValue(string) {
	return string.substring(string.indexOf(':') + 1, string.length);
};


function joinChatroom(chatroomName, clientName, socket) {
	let roomReference = roomToRefLookup[chatroomName];
	if (!roomReference) {
		roomToRefLookup[chatroomName] = uniqueRoomIdentifier++;
		roomReference = roomToRefLookup[chatroomName];
	}
	let room = chatrooms[roomReference];
	if (!room) {
		chatrooms[roomReference] = {};
		room = chatrooms[roomReference];  
		room.members = [];
	}
	room.members.push({ 'join_id': uniqueUserIdentifier, 'client_name': clientName, 'client_socket': socket });
	logger.log('info', 'After Joining: \n' + util.inspect(chatrooms));
	uniqueUserIdentifier++;
};


function writeMessageToChatroom(roomRef, clientName, message) {
	let room = chatrooms[roomRef];
	room.members.forEach(function(member) {
		member.client_socket.write(message);
	});
};


// This object will be exported. It handles all incoming requests to the server
const handler = {
	
	setupHandler: function(address, port) {
		logger.log('info', 'Address: ' + address + '\nPort: ' + port);
		serverAddress = address;
		serverPort = port;
	},

	handleData: function(socket, data) {
		/** 
		 * Request:
		 * JOIN_CHATROOM: [chatroom name]
		 * CLIENT_IP: [0]
		 * PORT: [0]
		 * CLIENT_NAME: [string Handle to identifier client user]
		 * Response:
		 * JOINED_CHATROOM: [chatroom name]
		 * SERVER_IP: [server IP]
		 * PORT: [server port]
		 * ROOM_REF: [integer that uniquely identifies chat room on server]
		 * JOIN_ID: [integer that uniquely identifies client joining]
		 */ 
		if (data.indexOf('JOIN_CHATROOM') === 0) {
			logger.log('info', socket.key + ' is attempting to join a chatroom');
			let requestLines = data.split('\n');
			let chatroomName = parseValue(requestLines[0]);
			let clientName = parseValue(requestLines[3]);
			logger.log('info', 'Chat Room: ' + chatroomName + '\nClient: ' + clientName);
			joinChatroom(chatroomName, clientName, socket);	
			socket.write(
				'JOINED_CHATROOM: ' + chatroomName + '\n' +
				'SERVER_IP: ' + serverAddress + '\n' +
				'PORT: ' + serverPort + '\n' +
				'ROOM_REF: ' + roomToRefLookup[chatroomName] + '\n' +
				'JOIN_ID: ' + (uniqueUserIdentifier - 1) + '\n'
			);
			writeMessageToChatroom(roomToRefLookup[chatroomName], clientName, 'New member: ' + clientName + '\n\n');
		}
		
		else if (data.indexOf('LEAVE_CHATROOM') === 0) {
			logger.log('info', socket.key + ' is attempting to leave a chatroom');
		}
		else if (data.indexOf('DISCONNECT') === 0) {
			logger.log('info', socket.key + ' is attempting to disconnect');
		}
		else if (data.indexOf('CHAT') === 0) {
			logger.log('info', socket.key + ' is attempting to chat');
		}
		else if (data.indexOf('HELO') === 0) {
			logger.log('info', socket.key + ' is attempting to say HELO');   
			socket.write(
				data + 
				'IP:' + serverAddress + 
				'\nPort:' + serverPort + 
				'\nStudentID:13321218\n'
			);
		}
		else if (data.indexOf('KILL_SERVICE') === 0) {
			logger.log('info', socket.key + ' is attempting to kill me');   
			process.exit();
		}
		else {
			logger.log('warn', 'Unknown command');
			socket.write('dank');
		}
	}
};

module.exports = handler;
