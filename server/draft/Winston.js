var Winston = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        pickPile: pickPile.bind(this),
        passPile: passPile.bind(this)
    };
};

function pickPile() {
    var draft = this.app.drafts[this.socket.draftId];
    if (!draft) {
        return;
    }
    var activePlayer = draft.public.activePlayer;
    if (isActivePlayer(draft, this.socket.name)) {
        let topCard = draft.piles[0].pop();
        let activePile = draft.public.activePile;
        draftCards(draft, draft.piles[activePile]);
        if (topCard) {
            draft.piles[activePile] = [topCard];
        } else {
            draft.piles[activePile] = [];
        }
        changePlayer(draft);
        changePile(draft, 1);
        updatePileCounts(draft);
        this.app.draftBroadcast(draft.public.id);
    } else {
        //hey you aren't allowed in here!
        console.log("Bad socket", this.socket.name);
    }

}

function passPile() {
    let draft = this.app.drafts[this.socket.draftId];
    if (!draft) {
        return;
    }
    let activePlayer = draft.public.activePlayer;
    let socketIndex = activePlayer-1;
    if (isActivePlayer(draft, this.socket.name)) {
        let topCard = draft.piles[0].pop();
        let activePile = draft.public.activePile;
        if (draft.public.activePile === 3) {
            if (topCard) {
                draftCards(draft, [topCard]);
                topCard = draft.piles[0].pop();
                if (topCard) {
                    //add top card to pile
                    draft.piles[activePile].push(topCard);
                } else {
                    //no top card, pile is now empty
                    draft.piles[activePile] = [];
                }
            } else {
                //this pile must be taken, no cards left in main, force player to take this pile
                draftCards(draft, draft.piles[activePile]);
                draft.piles[activePile] = [];//empty pile
            }
            changePlayer(draft);
            changePile(draft, 1);
        } else {
            //add top card to current pile
            if (topCard) {
                draft.piles[activePile].push(topCard);
            }
            //change the active pile
            changePile(draft, activePile+1);
        }
        updatePileCounts(draft);
        this.app.draftBroadcast(draft.public.id);
    } else {
        //hey you aren't allowed in here!
        console.log("Bad socket", this.socket.name);
    }

}

/**
 * Expose the size of each pile without exposing the cards
 */
function updatePileCounts(draft) {
    draft.public.pileSizes[0] = draft.piles[0].length;
    draft.public.pileSizes[1] = draft.piles[1].length;
    draft.public.pileSizes[2] = draft.piles[2].length;
    draft.public.pileSizes[3] = draft.piles[3].length;
}

/**
 * Swap the active player number from 1 to 2 and 2 to 1
 */
function changePlayer(draft) {
    draft.public.activePlayer = draft.public.activePlayer === 1 ? 2 : 1;
}

/**
 * Finds the first pile which isn't empty starting from the 'currentPile' passed in.
 */
function changePile(draft, currentPile) {
    while (currentPile <=3) {
        //TODO: loop back around in case the current pile is the only legal pile to take.
        if (draft.piles[currentPile].length === 0) {
            currentPile++;
        } else {
            break;
        }
    }
    draft.public.activePile = currentPile;
    //clear secret piles
    draft.secret[0].pile = [];
    draft.secret[1].pile = [];
    //set active players new pile
    draft.secret[draft.public.activePlayer-1].pile = draft.piles[draft.public.activePile];
}

/**
 * Determine if this socket name matches the name of the active player
 */
function isActivePlayer(draft, socketName) {
    let result = false;
    let socketIndex = draft.public.activePlayer-1;
    if (draft.sockets.length > socketIndex && 
            draft.sockets[socketIndex] && 
            draft.sockets[socketIndex].name === socketName) {
        result = true;
    }
    return result;
}

/**
 * Add cards to player's pool and deck
 */
function draftCards(draft, draftedCards) {
    var activePlayer = draft.public.activePlayer;
    var index = activePlayer-1;
    draft.secret[index].deck = draft.secret[index].deck.concat(draftedCards);
    console.log("Deck", draft.secret[index].deck);
}


module.exports = Winston;