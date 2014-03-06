var net = require('net');

var rooms = {};

/* -- room list format
  {
    roomName1: [socket1, socket2],
    roomName2: [ ... ]
  }
*/

var screenNames = [];

var broadcast = function (message, socket) {
  var room = rooms[socket._userInfo.room];
  if (message[0] !== '/') {
    for (var i = 0; i < room.length; i++) {
        room[i].write('<= ' + socket._userInfo.screenName + ': ' + message + '\r\n');
    }
  } else {
    var command = message.toLowerCase().split(' ');
    runCommand[command[0].slice(1)](command[1]);
  }
};

var requestHandler = function (socket) {
  socket._userInfo = {screenName: null, room: null};
  socket.write('<= Welcome to Super Best Buds Chat!\r\n<= Login name?\r\n');
  console.log(socket);

  // -- User Input

  socket.on('data', function (data) {
    if (socket._userInfo.screenName && socket._userInfo.room) {
      broadcast(socket, data);
    } else if (socket._userInfo.screenName) {
      joinroom(socket, data);
    } else {

    }
  });

  socket.on('end', function () {
    for (var i = 0; i < rooms[socket._userInfo.room].length; i++) {
      if (rooms[socket._userInfo.room][i] === socket) {
        rooms[socket._userInfo.room].splice(i, 1);
        return;
      }
    };
    broadcast(socket._userInfo.screenName + ' has left the room.', socket);
  });
};

var selectScreenName = function (name, socket) {
  for (var i = 0; i < screenNames.length; i++) {
    if (name === screenNames[i]) {
      socket.write('<= Sorry, name taken.\r\n<= Login name?\r\n');
      return;
    }
  }
  socket.write('<= Welcome, ' + name + '!\r\n<= Login name?\r\n');
};

var displayrooms = function () {
  socket.write('<= Available rooms are:\r\n');
  for (room in rooms) {
    socket.write('<= * ' + room + '(' + rooms[room].length + ')');
  }
  socket.write('<= Type "/join <room_name>" to join a room.\r\n<= If your room does not exist, one will be created.\r\n');
};

// type /who <roomName> in chat to
var displayUsers = function () {

}

var runCommand = {
  who: function (room, socket) {

  },

  join: function (room, socket) {
    if (!rooms[room]) {
      rooms[room] = [];
    }
    rooms[room].push(socket);
    socket.write('Joining room: ' + room + '\r\n');
  },

  quit: function (socket) {
    socket.close();
  },

  rooms: function (socket) {

  }
}

var server = net.createServer(requestHandler).listen(8080);