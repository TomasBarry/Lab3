var net = require('net');

var server = net.createServer((socket) => {
	socket.on('data', (data) => {
		console.log(data.toString());
	});	
});

server.on('error', (err) => {
	// handle errors here
	console.log('server error');
});
// grab a random port.
server.listen(8000, () => {
	console.log('opened server on', server.address());
});
