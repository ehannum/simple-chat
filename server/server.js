var net = require('net');

var rooms = {};

/* -- room list format
  {
    roomName1: [socket1, socket2],
    roomName2: [ ... ]
  }
*/

var screenNames = [];

var broadcast = function (socket, message) {
  var room = rooms[socket._userInfo.room];
  if (message[0] !== '\/') {
    for (var i = 0; i < room.length; i++) {
        room[i].write(socket._userInfo.screenName + ': ' + message + '\r\n');
    }
  } else {
    var command = message.toLowerCase().split(' ');
    if (runCommand[command[0].slice(1)]) {
      runCommand[command[0].slice(1)](socket, command[1]);
    } else {
      socket.write('Unknown command "' + command[0].slice(1) + '".\r\nType "/help" or "/?" to view commands.\r\n');
    }
  }
};

var requestHandler = function (socket) {
  socket._userInfo = {screenName: null, room: null};
  socket.write('Welcome to Super Best Buds Chat!\r\nLogin name?\r\n');

  // -- User Input

  socket.on('data', function (data) {
    data = data.toString().slice(0, data.toString().length - 2);
    if (socket._userInfo.screenName && socket._userInfo.room) {
      broadcast(socket, data);
    } else if (socket._userInfo.screenName) {
      runCommand.join(socket, data);
    } else {
      selectScreenName(socket, data);
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

var selectScreenName = function (socket, name) {
  for (var i = 0; i < screenNames.length; i++) {
    if (name === screenNames[i]) {
      socket.write('Sorry, "' + name + '" is taken.\r\nLogin name?\r\n');
      return;
    }
  }
  socket._userInfo.screenName = name;
  screenNames.push(name);
  socket.write('Welcome, ' + name + '!\r\nType "/help" or "/?" to view commands.\r\n');
};

var runCommand = {
  who: function (socket, room) {
    if (room) {
      for (var i = 0; i < rooms[room].length; i++) {
        socket.write('* ' + rooms[room][i]._userInfo.screenName + '\r\n');
      }
    } else {
      for (var i = 0; i < screenNames.length; i++) {
        socket.write('* ' + screenNames[i] + '\r\n');
      }
    }
    socket.write('end of list.\r\n');
  },

  join: function (socket, room) {
    if (!rooms[room]) {
      rooms[room] = [];
    }
    socket._userInfo.room = room;
    rooms[room].push(socket);
    socket.write('Joining room: ' + room + '\r\n');
  },

  quit: function (socket) {
    socket.end('BYE');
  },

  rooms: function (socket) {
    socket.write('Available rooms are:\r\n');
    for (room in rooms) {
      socket.write('* ' + room + ' (' + rooms[room].length + ')');
    }
    socket.write('Type "/join <room_name>" to join a room.\r\nIf your room does not exist, one will be created.\r\n');
  }
}

var server = net.createServer(requestHandler).listen(8080);