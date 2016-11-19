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
	return string.substring(string.indexOf(':') + 1, string.length).trim();
};


function leaveChatroom(socket, roomRef, joinID, clientName) {
	let room = chatrooms[roomRef];
	let leaverIndex = room.members.indexOf({ 'join_id': joinID, 'client_name': clientName, 'client_socket': socket });
	room.members.splice(leaverIndex, 1);
	logger.log('info', 'After removing: ' + util.inspect(chatrooms));
}


function joinChatroom(chatroomName, clientName, socket) {
	let roomReference = roomToRefLookup[chatroomName];
	logger.log('info', 'Room ref: ' + roomReference + ' for chatroom: ' + chatroomName);
	if (typeof roomReference === 'undefined') {
		roomToRefLookup[chatroomName] = uniqueRoomIdentifier++;
		roomReference = roomToRefLookup[chatroomName];
	}
	let room = chatrooms[roomReference];
	if (typeof room === 'undefined' && !room) {
		chatrooms[roomReference] = {};
		room = chatrooms[roomReference];  
		room.members = [];
	}
	room.members.push({ 'join_id': uniqueUserIdentifier, 'client_name': clientName, 'client_socket': socket });
	logger.log('info', 'After Joining: \n' + util.inspect(chatrooms));
	uniqueUserIdentifier++;
};


function writeMessageToChatroom(roomRef, message) {
	let room = chatrooms[roomRef];
	room.members.forEach(function(member) {
		member.client_socket.write(message);
	});
};


// This object will be exported. It handles all incoming requests to the server
const handler = {
	handleData: function(socket, data) { 
		if (data.indexOf('DISCONNECT') === 0) {
			logger.log('info', socket.key + ' is attempting to disconnect');
		}
		else if (data.indexOf('CHAT') === 0) {
			logger.log('info', socket.key + ' is attempting to chat');
			let requestLines = data.split('\n');
			let roomRef = parseValue(requestLines[0]);
			let clientName = parseValue(requestLines[2]);
			let message = parseValue(requestLines[3]);
			let response = 'CHAT:' + roomRef + '\n' +
				'CLIENT_NAME:' + clientName + '\n' + 
				'MESSAGE:' + message + '\n\n';
			logger.log('info', response);
			writeMessageToChatroom(roomRef, clientName, response);
		}
	},

	helo: function(socket, message, serverAddress, serverPort, studentNumber) {
		socket.write(message +
				'IP:' + serverAddress + '\n' +
				'Port:' + serverPort + '\n' +
				'StudentID:' + studentNumber + '\n\n');
	},

	join_chatroom: function(socket, message, serverAddress, serverPort) {
		let requestLines = message.split('\n');
		let chatroomName = parseValue(requestLines[0]);
		let clientName = parseValue(requestLines[3]);
		joinChatroom(chatroomName, clientName, socket);
		socket.write('JOINED_CHATROOM:' + chatroomName + '\n' +
				'SERVER_IP:' + serverAddress + '\n' +
				'PORT:' + serverPort + '\n' +
				'ROOM_REF:' + roomToRefLookup[chatroomName] + '\n' +
				'JOIN_ID:' + (uniqueUserIdentifier - 1) + '\n');
		writeMessageToChatroom(roomToRefLookup[chatroomName],
				'CHAT:' + roomToRefLookup[chatroomName] + '\n' +
				'CLIENT_NAME:' + clientName + '\n' +
				'MESSAGE:' + clientName + ' has joined this chatroom.\n\n');
	},

	leave_chatroom: function(socket, message) {
		let requestLines = message.split('\n');
		let roomRef = parseValue(requestLines[0]);
		let joinID = parseValue(requestLines[1]);
		let clientName = parseValue(requestLines[2]);
		socket.write('LEFT_CHATROOM:' + roomRef + '\n' +
				'JOIN_ID:' + joinID + '\n');
		writeMessageToChatroom(roomRef,
				'CHAT:' + roomRef + '\n' +
				'CLIENT_NAME:' + clientName + '\n' +
				'MESSAGE:' + clientName + ' has left this chatroom.\n\n');
		leaveChatroom(socket, roomRef, joinID, clientName);
	},

	kill_service: function(socket) {
		socket.end();
		socket.destroy();
	},

	unknown_command: function() {
		// stub code for unknown commands
	}
};

module.exports = handler;
