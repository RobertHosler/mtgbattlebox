var Draft = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        moveToDeck: moveToDeck.bind(this),
        moveToSideboard: moveToSideboard.bind(this)
    };
};

function moveToDeck(cardName) {
    console.log("Moving card to deck", cardName);
    var draft = this.app.drafts[this.socket.draftId];
    var activePlayer = draft.public.activePlayer;
    var socketIndex = -1;
    //find index of socket
    for (var i = 0; i !== draft.sockets.length; i++) {
        if (draft.sockets[i].name === this.socket.name) {
            socketIndex = i;
            break;
        }
    }
    if (socketIndex < 0) {
        return;//didn't find this socket
    }
    var secret = draft.secret[socketIndex];
    for (var i = 0; i !== secret.sideboard.length; i++) {
        if (secret.sideboard[i] === cardName) {
            secret.sideboard.splice(i, 1);//remove from sideboard
            break;
        }
    }
    secret.deck.push(cardName);
    this.socket.emit('draftUpdate', draft.public.id, secret);
}

function moveToSideboard(cardName) {
    console.log("Moving card to sideboard", cardName);
    var draft = this.app.drafts[this.socket.draftId];
    var activePlayer = draft.public.activePlayer;
    var socketIndex = -1;
    //find index of socket
    for (var i = 0; i !== draft.sockets.length; i++) {
        if (draft.sockets[i].name === this.socket.name) {
            socketIndex = i;
            break;
        }
    }
    if (socketIndex < 0) {
        return;//didn't find this socket
    }
    var secret = draft.secret[socketIndex];
    for (var i = 0; i !== secret.deck.length; i++) {
        if (secret.deck[i] === cardName) {
            secret.deck.splice(i, 1);//remove from deck
            break;
        }
    }
    secret.sideboard.push(cardName);
    this.socket.emit('draftUpdate', draft.public.id, secret);
    
    // for (var i = 0; i !== secret.deck.length; i++) {
    //     if (secret.deck[i] === cardName) {
    //         //remove from deck
    //         foundInDeck = true;
    //         break;
    //     }
    // }
    // if (foundInDeck) {
        // secret.sideboard.push(cardName);
    // }
}

module.exports = Draft;
