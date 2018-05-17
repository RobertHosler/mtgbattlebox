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
var Draft = require('draft/Draft');
var MtgFile = require('mtg/FileReader');
var Cards = require('mtg/Cards');

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
    var i = 0;
    app.allSockets.forEach(function(socket) {
        // console.log("Socket", i, "Event", event, "Data", data);
        i++;
        socket.emit(event, data);
    });
}

io.sockets.on('connection', function(socket) {

    var eventHandlers = {
        splitter: new BattleboxSplitter(app, socket),
        grid: new Grid(app, socket),
        draftCreator: new DraftCreator(app, socket),
        cards: new Cards(app, socket),
        draft: new Draft(app, socket)
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
    socket.on('getDraftStuff', function() {
        socket.emit('drafts', app.publicDrafts);
        socket.emit('cubes', app.cube.cubes);
        socket.emit('draftTypes', app.draftTypes);
    });
    
    socket.on('getBattleboxStuff', function() {
        socket.emit('battleboxes', app.battlebox.battleboxes);
    });
    
    socket.on('saveDeck', function(filePath) {
        var secretDraft = eventHandlers.draft.getDraftSecret();
        console.log("Saving deck", filePath);
        MtgFile.saveDeck(filePath, secretDraft);
        socket.emit('deckSaved', filePath);
    });
    
    socket.on('setName', function(name) {
        socket.name = name;
    });

});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup) {
      console.log('clean');
    }
    if (err) console.log(err.stack);
    if (options.exit) {
      MtgFile.saveAllCards(app.allCards);
      process.exit();
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));