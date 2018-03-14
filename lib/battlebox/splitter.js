var BattleboxSplitter = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        split: split.bind(this),
        getBattleboxes: getBattleboxes.bind(this)
    };
};

var fs = require('fs');
var battleboxLands = fs.readFileSync("files/battlebox_lands/lands_allied", 'utf8').split("\n");
var battleboxes = [];
fs.readdirSync("files/battleboxes").forEach(file => {
  var battlebox = {};
  battlebox.name = file;
  battlebox.cards = fs.readFileSync("files/battleboxes/"+file, 'utf8').split("\n");
  battleboxes.push(battlebox);
  // console.log("Battlebox: " + battlebox.name, "First Card: " + battlebox.cards[0]);
});

// Events

/**
 * Split a battlebox into two halves
 */
function split(battlebox, options) {
    var shuffledbox = shuffle(battlebox.cards);
    var half_length = Math.ceil(shuffledbox.length / 2);
    var leftSide = shuffledbox.splice(0, half_length);
    var rightSide = shuffledbox;
    var result = [];
    result.push(generateBattleboxString(leftSide, options));
    result.push(generateBattleboxString(rightSide, options));
    broadcast(this.app.allSockets, 'split', result);
}

function getBattleboxes() {
    this.socket.emit('battleboxes', battleboxes);
}

//Utilities

/**
 * Broadcast message to all sockets
 */
function broadcast(sockets, event, data) {
    sockets.forEach(function(socket) {
        socket.emit(event, data);
    });
}

function generateBattleboxString(array, options) {
    if (options.addLands) {
        return generateDecklistString(array, battleboxLands, options.addOnes);
    }
    else {
        return generateDecklistString(array, null, options.addOnes);
    }
}

/**
 * Converts array of cards to string of cards separated by newline characters with 1 prefixes
 */
function generateDecklistString(deck, sideboard, addOnes) {
    if (addOnes) {
        // console.log("adding ones to decklist");
        var result = '//Deck - ' + deck.length + ' Cards\n' + deck.map(function(element) { return "1 " + element; }).join('\n');
        if (sideboard) {
            result += '\n\n//Sideboard - ' + sideboard. length + ' Cards\n' + sideboard.map(function(element) { return "SB: 1 " + element; }).join('\n');
        }
        return result;
    }
    else {
        var result = '//Deck - ' + deck.length + ' Cards\n' + deck.join('\n');
        if (sideboard) {
            result += '\n\n//Sideboard - ' + sideboard. length + ' Cards\n' + sideboard.map(function(element) { return "SB: " + element; }).join('\n');
        }
        return result;
    }
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

module.exports = BattleboxSplitter;
