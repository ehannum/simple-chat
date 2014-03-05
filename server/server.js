var net = require('net');

var channels = {};

/* -- channel list format
  {
    channel1: {
      userName1: socket1,
      userName2: socket2
    },
    channel2: {
      ...
    }
  }
*/

// var users = {};

/* -- user list format
  {
    username1: {
      socket: socket,
      channel: channelName
    },
    username2: {
      ...
    }
  }
*/

var broadcast = function (socket, message, channel) {
  if (message) {
    for (user in channels[channel]) {
        channels[channel][user].write('<= ' + user + ': ' + message);
    }
  }
};

var requestHandler = function (socket) {
  socket.write('<= Welcome to Super Best Buds Chat!\r\n<= Login name?\r\n');
  console.log(socket);

  // -- User Input

  socket.on('data', function (data) {
    if (data) {
      broadcast(socket, data);
    }
  });

  socket.on('end', function () {
    // delete references to user in users and channels
    // broadcast "user has left the channel" message
  });
};

var joinChannel = function (socket, username, channel) {
  if (!channels[channel]) {
    channels[channel] = {};
  }
  channels[channel][username] = socket;
};

var server = net.createServer(requestHandler).listen(8080);