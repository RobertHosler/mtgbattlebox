var socketio = require('socket.io');
var express = require('express');
var router = express();
var http = require('http');
var path = require('path');
var server = http.createServer(router);
var io = socketio.listen(server);
io.set('log level', 2); //raise to see debug, verbose, etc
router.use(express.static(path.resolve(__dirname, 'client')));
router.use(function(req, res) {
    //Use res.sendfile, as it streams instead of reading the file into memory.
    //This allows angular to process the url
    res.sendfile(__dirname + '/client/index.html');
});

var BattleboxSplitter = require('battlebox/Splitter');
var Grid = require('draft/Grid');
var DraftCreator = require('draft/DraftCreator');
var MtgFile = require('mtg/FileReader');

var app = {
    allSockets: [],
    drafts: {},
    publicDrafts: {},
    battlebox: {
        battleboxLands: MtgFile.battleboxLands,
        battleboxes: MtgFile.battleboxes,
    },
    cube: {
        cubes: MtgFile.cubes
    },
    draftTypes: DraftCreator.draftTypes,
    allCards: MtgFile.allCards,
    broadcast: broadcast
};
// console.log(app.allCards);

function broadcast(event, data) {
    app.allSockets.forEach(function(socket) {
        socket.emit(event, data);
    });
}

io.sockets.on('connection', function(socket) {

    var eventHandlers = {
        splitter: new BattleboxSplitter(app, socket),
        grid: new Grid(app, socket),
        draftCreator: new DraftCreator(app, socket)
    };

    for (var category in eventHandlers) {
        var handler = eventHandlers[category].handler;
        for (var event in handler) {
            socket.on(event, handler[event]);
        }
    }

    console.log("New Socket");
    // Keep track of the socket
    app.allSockets.push(socket);

    socket.on('disconnect', function() {
        console.log("Socket Removed");
        app.allSockets.splice(app.allSockets.indexOf(socket), 1);
    });

    // console.log("Emitting cubes:", app.cube.cubes);
    socket.emit('drafts', app.publicDrafts);
    socket.emit('cubes', app.cube.cubes);
    socket.emit('battleboxes', app.battlebox.battleboxes);
    socket.emit('draftTypes', app.draftTypes);

});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});
