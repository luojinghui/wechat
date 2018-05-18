/**
 * @author Luojinghui & luojinghui424@gmail.com
 * @date 2018/5/16
 * @Description:
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = './history.json';
var count = [];

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	console.log('A user connected');
	count.push(socket.id);
	io.emit('count', count.length);

	socket.on('chat message', function(msg) {
		console.log('message: ' + JSON.stringify(msg));

		let result = JSON.parse(fs.readFileSync(path)) || [];
		if (result.length > 50) {
			result.length = 50;
		}
		result.push(msg);

		fs.writeFile(path, JSON.stringify(result), function(err) {
			if (err) console.log('write fail, please check it!');
		});

		io.emit('chat message', msg);
	});

	socket.on('get data', function(data) {
		console.log('A user coming: ', JSON.stringify(data));

		let result = JSON.parse(fs.readFileSync(path));

		io.to(socket.id).emit('get data', result);
	});

	socket.on('disconnect', () => {
		console.log('user disconnected!');

		io.emit('count', count.length);
		count.splice(del(count, socket.id), 1);
	});
});

function del(count, id) {
	let len = count.length;
	for (let i = 0; i < len; i++) {
		if (count[i] === id) return i;
	}

	return -1;
}

http.listen(9999, () => {
	console.log('listening on *:9999');
});
