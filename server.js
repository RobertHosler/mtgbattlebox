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

const mtg = require('mtgsdk');
const getMtgJson = require('mtg-json');
var Scry = require("scryfall-sdk");

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
router.use(function(req, res) {
  //Use res.sendfile, as it streams instead of reading the file into memory.
  //This allows angular to process the url
  res.sendfile(__dirname + '/client/index.html');
});

var messages = [];
var sockets = [];
var drafts = [];
var cubes = [];
var battleboxes = [];
var battleboxLands = [];

battleboxLands = fs.readFileSync("files/battlebox_lands/lands_allied", 'utf8').split("\n");

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

// getMtgJson('cards', 'files')
//   .then(json => {
//     let stromCrow = json['stormCrow'];
//     console.log(stromCrow.types);
//   });


// var cards = [];
// Scry.Cards.byName("Restoration Angel").then(result => {
//   cards.push(result);
//   console.log(result.name);
//   console.log(result);
// });

//get all cards with scryfall

var allCardsPath = "files/AllCards";
var refreshAllCards = !fs.existsSync(allCardsPath);

console.log("Refresh All Cards?", refreshAllCards);

var allCards = {};
if (refreshAllCards) {
  //Get all cards from srcyfall and save to file on server
  // Scry.Cards.all().on("data", card => {
  //     console.log(card.name);
  //     allCards.set(card.name, card);
  // }).on("end", () => {
  //     console.log("done");
  // });
  var allCardsJson = JSON.stringify(allCards);
  console.log("All Cards JSON", allCardsJson);
  fs.writeFileSync(allCardsPath, allCardsJson);
} else {
  //Get all cards from local server
  var allCardsRaw = fs.readFileSync(allCardsPath);
  console.log("All cards raw", allCardsRaw);
  var allCardsJson = JSON.parse(allCardsRaw);
  console.log("All cards json", allCardsJson);
  allCards = allCardsJson;
  // allCards = new Map(allCardsJson);
  // Array.from(allCardsJson).map(row => <RowRender key={id.row} row={row} />);
  console.log("All Cards read from file");
}

console.log(battleboxes[0].cards[0]);
mtg.card.where( { name : battleboxes[0].cards[0] })
  .then(cards => {
    console.log(cards[0].name + " " + cards[0]);
});

io.on('connection', function(socket) {
  messages.forEach(function(data) {
    socket.emit('message', data);
  });
  socket.emit('drafts', drafts);
  socket.emit('cubes', cubes);
  socket.emit('battleboxes', battleboxes);

  sockets.push(socket);
  
  socket.on('disconnect', function() {
    sockets.splice(sockets.indexOf(socket), 1);
    updateRoster();
  });

  socket.on('createDraft', function(playerName, draftType, cube) {
    //TODO: prevent players from creating multiple drafts
    var draft = {};
    draft.id = (Math.random() + 1).toString(36).slice(2, 18);//TODO: prevent same id from appearing
    draft.playerCount = 1;
    draft.players = [];
    draft.players.push(String(playerName || 'Anonymous'));
    draft.draftType = draftType.name;
    draft.cube = cube;
    draft.creationTime = Date.now();
    draft.displayTime = displayTime();
    drafts.push(draft);//TODO: add drafts to map, not an array
    socket.emit('drafts', drafts);
    // var draftFile = '';
    // drafts.forEach(function(draft) {
    //   draftFile += draft.id + "\n";
    // });
    // console.log(draftFile);
    // fs.writeFile("files/drafts", draftFile, function(err) {
    //   if(err) {
    //       return console.log(err);
    //   } else {
        
    //   }
    // }); 
  });
  
  socket.on('split', function(battlebox, options) {
    var shuffledbox = shuffle(battlebox.cards);
    var half_length = Math.ceil(shuffledbox.length / 2);    
    var leftSide = shuffledbox.splice(0,half_length);
    var rightSide = shuffledbox;
    var result = [];
    result.push(generateBattleboxString(leftSide, options));
    result.push(generateBattleboxString(rightSide, options));
    broadcast('split', result);
    // getFullCard(leftSide[0]);
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

function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
  }

  return array;
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