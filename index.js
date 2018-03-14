var socketio = require('socket.io');
var express = require('express');
var router = express();
var http = require('http');
var path = require('path');
var server = http.createServer(router);
var io = socketio.listen(server);
io.set('log level', 2);//raise to see debug, verbose, etc
router.use(express.static(path.resolve(__dirname, 'client')));
router.use(function(req, res) {
  //Use res.sendfile, as it streams instead of reading the file into memory.
  //This allows angular to process the url
  res.sendfile(__dirname + '/client/index.html');
});

var BattleboxSplitter = require('battlebox/splitter');

var app = {
  allSockets: []
};

io.sockets.on('connection', function (socket) {
   
   var eventHandlers = {
       splitter: new BattleboxSplitter(app, socket)
   };
   
   for (var category in eventHandlers) {
       var handler = eventHandlers[category].handler;
       for (var event in handler) {
           socket.on(event, handler[event]);
       }
   }
   
    // Keep track of the socket
    app.allSockets.push(socket);
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});