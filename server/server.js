var net = require('net');

var openSockets = [];

var broadcast = function (socket, message) {
  for (var i = 0; i < openSockets.length; i++) {
    if (openSockets[i] !== socket) {
      openSockets[i].write('<= Anonymous: ' + message);
    }
  };
};

var requestHandler = function (socket) {
  openSockets.push(socket);
  broadcast('Welcome to Super Best Buds Chat!');
  broadcast('Login name?');
  socket.on('data', function (data) {
    broadcast(socket, data);
  });
};

var server = net.createServer(requestHandler).listen(8080);