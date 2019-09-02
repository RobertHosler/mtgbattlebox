class Draft {
    constructor(app, socket) {
        this.app = app;
        this.socket = socket;

        // Expose handler methods for events
        this.handler = {
            // use the bind function to access this.app and this.socket in events
            moveToDeck: moveToDeck.bind(this),
            moveToSideboard: moveToSideboard.bind(this)
        };

        this.getDraftSecret = function () {
            var draft = this.app.drafts[this.socket.draftId];
            if (!draft) {
                return;
            }
            var activePlayer = draft.common.activePlayer;
            var socketIndex = -1;
            //find index of socket
            for (var i = 0; i !== draft.sockets.length; i++) {
                if (draft.sockets[i].name === this.socket.name) {
                    socketIndex = i;
                    break;
                }
            }
            if (socketIndex < 0) {
                return; //didn't find this socket
            }
            var secret = draft.secret[socketIndex];
            return secret;
        };

    }

    /**
     * Add cards to player's pool and deck
     */
    static draftCards(draft, draftedCards) {
        var activePlayer = draft.common.activePlayer;
        var index = activePlayer - 1;
        draft.secret[index].deck = draft.secret[index].deck.concat(draftedCards);
        console.log("Deck", draft.secret[index].deck);
    }

}

function moveToDeck(cardName) {
    console.log("Moving card to deck", cardName);
    var draft = this.app.drafts[this.socket.draftId];
    var secret = this.getDraftSecret();
    if (!cardName || !secret) {
        return;
    }
    var foundInSideboard = false;
    for (var i = 0; i !== secret.sideboard.length; i++) {
        if (secret.sideboard[i] === cardName) {
            secret.sideboard.splice(i, 1); //remove from sideboard
            foundInSideboard = true;
            break;
        }
    }
    if (foundInSideboard) {
        secret.deck.push(cardName);
        this.app.draftBroadcast(draft.common.id);
    }
}

function moveToSideboard(cardName) {
    console.log("Moving card to sideboard", cardName);
    var draft = this.app.drafts[this.socket.draftId];
    var secret = this.getDraftSecret();
    if (!cardName || !secret) {
        return;
    }
    var foundInDeck = false;
    for (var i = 0; i !== secret.deck.length; i++) {
        if (secret.deck[i] === cardName) {
            secret.deck.splice(i, 1); //remove from deck
            foundInDeck = true;
            break;
        }
    }
    if (foundInDeck) {
        secret.sideboard.push(cardName);
        this.app.draftBroadcast(draft.common.id);
    }
}

export default Draft;
