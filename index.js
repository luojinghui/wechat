/**
 * @author Luojinghui & luojinghui424@gmail.com
 * @date 2018/5/16
 * @Description:
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', function(msg){

    console.log('message: ' + msg);

    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected!');
  })
});

http.listen(9999, () => {
  console.log('listening on *:9999');
});