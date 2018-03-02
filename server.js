//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var fs = require('fs');


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];
var drafts = [];
var cubes = [];
var battleboxes = [];

fs.readdirSync("files/battleboxes").forEach(file => {
  var battlebox = {};
  battlebox.name = file;
  battlebox.cards = fs.readFileSync("files/battleboxes/"+file, 'utf8').split("\n");
  battleboxes.push(battlebox);
  console.log("Battlebox: " + battlebox.name, "First Card: " + battlebox.cards[0]);
});

fs.readdirSync("files/cubes").forEach(file => {
  var cube = {};
  cube.name = file;
  cube.cards = fs.readFileSync("files/cubes/"+file, 'utf8').split("\n");
  cubes.push(cube);
  console.log("Cube: " + cube.name, "First Card: " + cube.cards[0]);
});

io.on('connection', function(socket) {
  messages.forEach(function(data) {
    socket.emit('message', data);
  });
  socket.emit('drafts', drafts);
  socket.emit('cubes', cubes);

  sockets.push(socket);
  
  socket.on('disconnect', function() {
    sockets.splice(sockets.indexOf(socket), 1);
    updateRoster();
  });

  socket.on('createDraft', function(playerName, draftType, cube) {
    //TODO: prevent players from creating multiple drafts
    var draft = {};
    draft.id = (Math.random() + 1).toString(36).slice(2, 18);
    draft.playerCount = 1;
    draft.players = [];
    draft.players.push(String(playerName || 'Anonymous'));
    draft.draftType = draftType.name;
    draft.cube = cube;
    draft.creationTime = Date.now();
    draft.displayTime = displayTime();
    drafts.push(draft);
    socket.emit('drafts', drafts);
  });

  socket.on('message', function(msg) {
    // console.log('Received message:', msg);
    var text = String(msg || '');

    if (!text)
      return;

    socket.get('name', function(err, name) {
      var data = {
        name: name,
        text: text
      };

      broadcast('message', data);
      messages.push(data);
    });
  });

  socket.on('identify', function(name) {
    socket.set('name', String(name || 'Anonymous'), function(err) {
      updateRoster();
    });
  });
});

function updateRoster() {
  async.map(
    sockets,
    function(socket, callback) {
      socket.get('name', callback);
    },
    function(err, names) {
      broadcast('roster', names);
    }
  );
}

function displayTime() {
  var str = "";

  var currentTime = new Date()
  var hours = currentTime.getHours()
  var minutes = currentTime.getMinutes()
  var seconds = currentTime.getSeconds()

  if (minutes < 10) {
    minutes = "0" + minutes
  }
  if (seconds < 10) {
    seconds = "0" + seconds
  }
  var amPm = "";
  if (hours > 11) {
    amPm += "PM"
  }
  else {
    amPm += "AM"
  }
  if (hours > 12) {
    hours = hours - 12;
  }
  str += hours + ":" + minutes + ":" + seconds + " " + amPm;
  return str;
}

function broadcast(event, data) {
  sockets.forEach(function(socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
