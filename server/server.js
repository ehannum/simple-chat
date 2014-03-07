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
  if (message[0] !== '') {
    for (var i = 0; i < room.length; i++) {
        room[i].write(socket._userInfo.screenName + ': ' + message + '\r\n');
    }
  }
};

var requestHandler = function (socket) {
  socket._userInfo = {screenName: null, room: null};
  socket.write('Welcome to Super Best Buds Chat!\r\nLogin name?\r\n');

  // -- User Input

  socket.on('data', function (data) {
    data = data.toString().slice(0, data.toString().length - 2);
    if (data[0] !== '\/') {
      if (socket._userInfo.screenName && socket._userInfo.room) {
        broadcast(socket, data);
      } else if (socket._userInfo.screenName) {
        runCommand.rooms(socket);
        runCommand.join(socket, data);
      } else {
        selectScreenName(socket, data);
      }
    } else {
      var command = data.toLowerCase().split(' ');
      if (runCommand[command[0].slice(1)]) {
        runCommand[command[0].slice(1)](socket, command[1], command.slice(2).join(' '));
      } else {
        socket.write(' * Unknown command "' + command[0].slice(1) + '".\r\nType "/help" to view commands.\r\n');
      }
    }
  });

  socket.on('end', function () {
    disconnectSocket(socket);
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
  socket.write('Welcome, ' + name + '!\r\nType "/help" to view commands.\r\n');
};

var disconnectSocket = function (socket) {
  if (socket._userInfo.room) {
    for (var i = 0; i < rooms[socket._userInfo.room].length; i++) {
      if (rooms[socket._userInfo.room][i] === socket) {
        rooms[socket._userInfo.room].splice(i, 1);
      }
    }
    if (rooms[socket._userInfo.room].length === 0) {
      delete rooms[socket._userInfo.room];
    } else {
      broadcast(socket, socket._userInfo.screenName + ' has left the room.');
    }
  }
  if (socket._userInfo.screenName) {
    for (var j = 0; j < screenNames.length; j++) {
      if (screenNames[j] === socket._userInfo.screenName) {
        screenNames.splice(j, 1);
      }
    }
  }
};

var runCommand = {
  help: function (socket) {
    socket.write(
      '\r\nList of all commands\r\n\r\n' +
      ' * /help . . . . . . . . Displays this list\r\n' +
      ' * /join <room_name> . . Switches to the specified chatroom\r\n' +
      ' * /quit . . . . . . . . Disconnects from the server\r\n' +
      ' * /rooms  . . . . . . . Lists all joinable chatrooms\r\n' +
      ' * /w <user> <message> . Sends private message to one user\r\n' +
      ' * /who  . . . . . . . . Lists all online users\r\n' +
      ' * /who <room_name>  . . Lists all users in the specified chatroom\r\n\r\n'
    );
  },

  who: function (socket, room) {
    if (room) {
      if (rooms[room]) {
        for (var i = 0; i < rooms[room].length; i++) {
          socket.write('* ' + rooms[room][i]._userInfo.screenName + '\r\n');
        }
        socket.write('end of list\r\n');
      } else {
        socket.write('Room "' + room + '" could not be found.\r\n');
      }
    } else {
      for (var j = 0; j < screenNames.length; j++) {
        socket.write('* ' + screenNames[j] + '\r\n');
      }
      socket.write('end of list\r\n');
    }
  },

  join: function (socket, room) {
    if (socket._userInfo.room) {
      broadcast(socket, ' * ' + socket._userInfo.screenName + ' has left the room.');
      for (var i = 0; i < rooms[socket._userInfo.room].length; i++) {
        if (rooms[socket._userInfo.room][i] === socket) {
          rooms[socket._userInfo.room].splice(i, 1);
        }
      }
      if (rooms[socket._userInfo.room].length === 0) {
        delete rooms[socket._userInfo.room];
      }
    }
    if (!rooms[room]) {
      rooms[room] = [];
    }
    socket._userInfo.room = room;
    rooms[room].push(socket);
    socket.write('Joining room: ' + room + '\r\nUsers in room:\r\n');
    for (var j = 0; j < rooms[room].length; j++) {
      socket.write(' * ' + rooms[room][j]._userInfo.screenName + '\r\n');
    }
    socket.write('end of list\r\n\r\n');
    broadcast(socket, ' * ' + socket._userInfo.screenName + ' has joined the chat.');
  },

  quit: function (socket) {
    socket.end('BYE\r\n');
  },

  w: function (socket, user, message) {
    for (var room in rooms) {
      for (var i = 0; i < rooms[room].length; i++) {
        if (rooms[room][i]._userInfo.screenName === user) {
          rooms[room][i].write(' ~ ' + socket._userInfo.screenName + ' whispers: ' + message + ' ~\r\n');
          return;
        }
      }
    }
    socket.write(' * User "' + user + '" not found.');
  },

  rooms: function (socket) {
    socket.write('Available rooms are:\r\n');
    for (var room in rooms) {
      socket.write('* ' + room + ' (' + rooms[room].length + ')\r\n');
    }
    socket.write('end of list\r\nType "/join <room_name>" to join a room.\r\nIf your room does not exist, one will be created.\r\n');
  }
};

var port = process.env.PORT || 8080;

var server = net.createServer(requestHandler).listen(port);