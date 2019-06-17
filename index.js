/**
 * @author Luojinghui & luojinghui424@gmail.com
 * @date 2018/5/16
 * @Description:
 */
var fs = require('fs');
var https = require('https');
var express = require('express');
var app = express();

var options = {
  key: fs.readFileSync('./www.luojh.com.key'),
  cert: fs.readFileSync('./www.luojh.com.pem')
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);

var path = './history.json';
var count = [];
app.use(express.static('public'));

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
		let copyResult = result;
		if (copyResult.length > 100) {
			copyResult.length = 100;
		}

		msg.id = socket.id;
		msg.time = new Date() + "";

		if(!msg.avathor) {
			let randomNum = parseInt(Math.random() * 8);
			
			msg.avathor = `/img/${randomNum}.png`;
		} else {
			msg.avathor = msg.avathor;
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

server.listen(3999, () => {
	console.log('listening on *:3999');
});