const socketio = require('socket.io');
module.exports = (function() {

    var sockets = [];

    var init = (server, callback) => {
        console.log('I am a SocketManager!');
        var io = socketio.listen(server);
        io.on('connection', this.onConnect);
        return io;
    };
    
    var broadcast = (event, data) => {
        sockets.forEach(function(socket) {
            socket.emit(event, data);
        });
    };

    var onConnect = (socket) => {
        sockets.push(socket);
        console.log("Socket added, sockets length: " + this.sockets.length);

        socket.on('disconnect', function() {
            this.sockets.splice(this.sockets.indexOf(socket), 1);
            this.updateRoster();
        });
        socket.on('identify', function(name) {
            socket.set('name', String(name || 'Anonymous'), function(err) {
                updateRoster();
            });
        });

        socket.on('createDraft', function(playerName, draftType, cube) {
            //TODO: prevent players from creating multiple drafts
            var draft = {};
            draft.id = (Math.random() + 1).toString(36).slice(2, 18); //TODO: prevent same id from appearing
            draft.playerCount = 1;
            draft.players = [];
            draft.players.push(String(playerName || 'Anonymous'));
            draft.draftType = draftType.name;
            draft.cube = cube;
            draft.creationTime = Date.now();
            draft.displayTime = displayTime();
            drafts.push(draft); //TODO: add drafts to map, not an array
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
            var leftSide = shuffledbox.splice(0, half_length);
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
    }

    var generateBattleboxString = function(array, options) {
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
    var generateDecklistString = function(deck, sideboard, addOnes) {
        var result;
        if (addOnes) {
            console.log("adding ones to decklist");
            result = '//Deck - ' + deck.length + ' Cards\n' + deck.map(function(element) { return "1 " + element; }).join('\n');
            if (sideboard) {
                result += '\n\n//Sideboard\n' + sideboard.map(function(element) { return "SB: 1 " + element; }).join('\n');
            }
        } else {
            result = '//Deck - ' + deck.length + ' Cards\n' + deck.join('\n');
            if (sideboard) {
                result += '\n\n//Sideboard\n' + sideboard.map(function(element) { return "SB: " + element; }).join('\n');
            }
        }
        return result;
    }

    var updateRoster = function() {
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

    var shuffle = function(array) {
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
    
    var displayTime = function() {
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


    var getFullCard = function(cardName, callback) {
        var fullCard = allCards[cardName];
        if (!fullCard) {
            Scry.Cards.byName(cardName).then(result => {
                fullCard = result;
                console.log("Retrieved", result.name);
                // console.log(result);
                // console.log("Full card retrieved", fullCard);
                allCards[cardName] = fullCard; //save the card to allCards
                callback(fullCard);
            });
        }
        else {
            callback(fullCard);
        }
    }

    var saveAllCards = function() {
        var allCardsFile = JSON.stringify(allCards);
        // console.log("Saving all cards", allCards, allCardsFile);
        fs.writeFileSync(allCardsPath, allCardsFile);
    }

    return {
		init: init,
		broadcast: broadcast,
		onConnect: onConnect,
		generateBattleboxString: generateBattleboxString,
		generateDecklistString: generateDecklistString,
		updateRoster: updateRoster,
		shuffle: shuffle,
		displayTime: displayTime,
		getFullCard: getFullCard,
		saveAllCards: saveAllCards
	};
})();
