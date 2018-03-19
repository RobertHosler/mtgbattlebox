//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.


var Draft = require('model/Draft');
// Draft.log();

// var SocketManager = require('SocketManager');

var fs = require('fs');
var http = require('http');
var path = require('path');
var async = require('async');
var express = require('express');
const mtg = require('mtgsdk');
const getMtgJson = require('mtg-json');
var Scry = require("scryfall-sdk");
var socketio = require('socket.io');

var Grid = require('draft/Grid');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
io.set('log level', 1);

router.use(express.static(path.resolve(__dirname, 'client')));
router.use(function(req, res) {
  //Use res.sendfile, as it streams instead of reading the file into memory.
  //This allows angular to process the url
  res.sendfile(__dirname + '/client/index.html');
});

var messages = [];
var sockets = [];
var drafts = {};
var publicDrafts = {};

//TEST GRID
// var gridDraft = Grid.createDraft('12345', cubes[0].cards, 18, 3);
// console.log(gridDraft);

//Get existing all cards json
var allCardsPath = "files/AllCards";
var allCardsExists = fs.existsSync(allCardsPath);//check if path exists
var allCards = {};
if (allCardsExists) {
  //Get all cards stored on local server
  var allCardsRaw = fs.readFileSync(allCardsPath);
  var allCardsJson = JSON.parse(allCardsRaw);
  allCards = allCardsJson;
  // console.log("All Cards read from file");
} else {
  //Create initial file
  var allCardsJson = JSON.stringify(allCards);
  fs.writeFileSync(allCardsPath, allCardsJson);
}

var chatNsp = io.of('/chat');
chatNsp.on('connection', function(socket){
  console.log('someone connected to chat');
});
var splitterNsp = io.of('splitBattlebox');
splitterNsp.on('connection', function(socket){
  console.log('someone connected to splitter');
});
var room = 'chatroom';  // whereas user._id is the user's unique id
io.on('connection', function(socket){
  socket.join(room);
  console.log('someone connected to chatroom');
});

io.on('connection', function(socket) {

  sockets.push(socket);
  // sockets.push(socket);
  
  socket.on('disconnect', function() {
    sockets.splice(sockets.indexOf(socket), 1);
    updateRoster(sockets);
  });

  socket.on('createDraft', function(playerName, draftType, cube) {
    //TODO: prevent players from creating multiple drafts
    //generate unique draft id
    var draftId;
    while (true) {
      draftId = (Math.random() + 1).toString(36).slice(2, 18);//TODO: prevent same id from appearing
      if (drafts[draftId]) {
        continue;//id not unique, keep generating
      } else {
        break;//id is unique
      }
    }
    var draft = {};
    if (draftType === "grid") {
      draft = Grid.createDraft(cube);
    } else {
      //Error - type not supported
    }
    draft.public.id = draftId;
    draft.public.players.push(String(playerName || 'Anonymous'));
    draft.public.type = draftType;
    draft.sockets = ['', socket];//add socket as player one
    drafts[draftId] = draft;//map draft to draft id
    publicDrafts[draftId] = draft.public;//map draft to draft id
    draft.sockets[1].emit('draftUpdate', draft.secret[1]);//notify individual player of secret draft update
    broadcast('drafts', publicDrafts);//publish all public draft updates
  });
  
  /**
   *  Split a battlebox into two halves
   */
  socket.on('split', function(battlebox, options) {
    var shuffledbox = shuffle(battlebox.cards);
    var half_length = Math.ceil(shuffledbox.length / 2);    
    var leftSide = shuffledbox.splice(0,half_length);
    var rightSide = shuffledbox;
    var result = [];
    result.push(generateBattleboxString(leftSide, options));
    result.push(generateBattleboxString(rightSide, options));
    broadcast('split', result);
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
      updateRoster(sockets);
    });
  });

  socket.on('chatJoin', function(name) {
    messages.forEach(function(data) {
      socket.emit('message', data);
    });
  });

  socket.on('battleboxGet', function(name) {
    socket.emit('battleboxes', battleboxes);
  });
  

  socket.emit('drafts', drafts);
  socket.emit('cubes', cubes);
});

function generateBattleboxString(array, options) {
  if (options.addLands) {
    return generateDecklistString(array, battleboxLands, options.addOnes);
  } else {
    return generateDecklistString(array, null, options.addOnes);
  }
}

/**
 * Converts array of cards to string of cards separated by newline characters with 1 prefixes
 */
function generateDecklistString(deck, sideboard, addOnes) {
  if (addOnes) {
    console.log("adding ones to decklist");
    var result = '//Deck - ' + deck.length + ' Cards\n' + deck.map(function(element) { return "1 " + element; }).join('\n');
    if (sideboard) {
      result += '\n\n//Sideboard\n' + sideboard.map(function(element) { return "SB: 1 " + element; }).join('\n');
    }
    return result;
  } else {
    var result = '//Deck - ' + deck.length + ' Cards\n' + deck.join('\n');
    if (sideboard) {
      result += '\n\n//Sideboard\n' + sideboard.map(function(element) { return "SB: " + element; }).join('\n');
    }
    return result;
  }
}

function updateRoster(sockets) {
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

function shuffle(array) {
  var counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
      // Pick a random index
      var index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      var temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
  }

  return array;
}

function getFullCard(cardName, callback) {
  var fullCard = allCards[cardName];
  if (!fullCard) {
    Scry.Cards.byName(cardName).then(result => {
      fullCard = result;
      console.log("Retrieved", result.name);
      // console.log(result);
      // console.log("Full card retrieved", fullCard);
      allCards[cardName] = fullCard;//save the card to allCards
      callback(fullCard);
    });
  } else {
    callback(fullCard);
  }
}

function saveAllCards() {
  var allCardsFile = JSON.stringify(allCards);
  // console.log("Saving all cards", allCards, allCardsFile);
  fs.writeFileSync(allCardsPath, allCardsFile);
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

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup) {
      console.log('clean');
    }
    if (err) console.log(err.stack);
    if (options.exit) {
      saveAllCards();
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