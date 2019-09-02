var PickBurn = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        pickCard: pickCardIndex.bind(this),
        burnCard: burnCardIndex.bind(this),
        pickCardName: pickCardName.bind(this),
        burnCardName: burnCardName.bind(this)
    };
};

function pickCardName(cardName) {
    var draft = this.app.drafts[this.socket.draftId];
    var playerNumber = getPlayerNumber(draft, this.socket.name);
    if (playerNumber < 0) {
    	console.log("Pick invalid, player number invalid", playerNumber);
    	return;
    }
    var index;
    pickCard(draft, playerNumber, index, cardName);
    
    // this.app.broadcast('drafts', this.app.publicDrafts);
    // this.socket.emit('draftUpdate', draft.common.id, draft.secret[playerNumber]);
    this.app.draftBroadcast(draft.common.id);
}

function pickCardIndex(index) {
    var draft = this.app.drafts[this.socket.draftId];
    var playerNumber = getPlayerNumber(draft, this.socket.name);
    if (playerNumber < 0) {
    	console.log("Pick invalid, player number invalid", playerNumber);
    	return;
    }
    var cardName;
    pickCard(draft, playerNumber, index, cardName);
    
    this.app.draftBroadcast(draft.common.id);
}

function pickCard(draft, playerNumber, index, cardName) {
    var draftSecret = draft.secret[playerNumber];
    draftSecret.picksThisTurn++;
    var picksAllowed = draft.picks[draft.common.turn];
    if (draftSecret.picksThisTurn > picksAllowed) {
    	//quit if number of picks is greater than the number of picks allowed this turn
    	console.log("Pick invalid, number of picks exceeded the limit", draftSecret.picksThisTurn);
    	return;
    }
    
    //add picked card to pool, remove from pack
    if (!index) {
        index = draftSecret.pack.indexOf(cardName);
    }
    if (index < 0 || index >= draftSecret.pack.length) {
    	console.log("Pick invalid, index out of bounds", index);
        return;
    }
	console.log("Player " + (playerNumber + 1) + " picked", draftSecret.pack[index]);
    var pickedCard = draftSecret.pack[index];
    var packIndex = draftSecret.packIndex;
    draftSecret.pack.splice(index, 1);
    draftSecret.deck.push(pickedCard);
    
    if (draftSecret.picksThisTurn < picksAllowed) {
    	//another pick should be made.
    } else if (draft.common.turn == draft.common.turns) {
    	//last turn, no more picks, burn the rest of the pack
        draft['packs'][packIndex] = [];//set an empty array
        draftSecret.pack = [];
        
        //when both players are done, start new round or end the draft
		if (draft.secret[0].pack.length == 0 && 
			draft.secret[1].pack.length == 0) {
    		if (draft.common.round < draft.common.rounds) {
    			startNewRound(draft);
    		} else {
    		    console.log("Draft is over.", "Rounds:", draft.common.rounds, "Round:", draft.common.round);
				draft.common.complete = true;
    		}
		}
    } else if (draft.burns[draft.common.turn] > 0) {
    	draftSecret.burning = true;
    	draftSecret.picking = false;
    } else {
        draftSecret.passing = true;
    	draft = passPack(draft);
    }
}

function burnCardName(cardName) {
    var draft = this.app.drafts[this.socket.draftId];
    var playerNumber = getPlayerNumber(draft, this.socket.name);
    if (playerNumber < 0) {
    	console.log("Pick invalid, player number invalid", playerNumber);
    	return;
    }
    var index;
    burnCard(draft, playerNumber, index, cardName);
    
    this.app.draftBroadcast(draft.common.id);
}

function burnCardIndex(index) {
    var draft = this.app.drafts[this.socket.draftId];
    var playerNumber = getPlayerNumber(draft, this.socket.name);
    if (playerNumber < 0) {
    	console.log("Pick invalid, player number invalid", playerNumber);
    	return;
    }
    var cardName;
    burnCard(draft, playerNumber, index, cardName);
    
    this.app.draftBroadcast(draft.common.id);
}

function burnCard(draft, playerNumber, index, cardName) {
    //remove card from pack
    var draftSecret = draft.secret[playerNumber];
    draftSecret.burnsThisTurn++;
    var burnsAllowed = draft.burns[draft.common.turn];
    if (draftSecret.burnsThisTurn > burnsAllowed) {
    	//quit if number of burns is greater than the number of burns allowed this turn
    	console.log("Burn invalid, number of burns exceeded the limit", draftSecret.burnsThisTurn);
    	return;
    }
    
    //remove the card from the pack
    if (!index) {
        index = draftSecret.pack.indexOf(cardName);
    }
    if (index < 0 || index >= draftSecret.pack.length) {
    	console.log("Pick invalid, index out of bounds", index);
        return;
    }
	console.log("Player " + (playerNumber + 1) + " burned", draftSecret.pack[index]);
    draftSecret.pack.splice(index, 1);
    
    if (draftSecret.burnsThisTurn < burnsAllowed) {
    	//burn more cards
    } else {
        draftSecret.passing = true;
    	draft = passPack(draft)
    }
}

/**
 * Reset the turn and increment the round counter and packs for each player.
 */
function startNewRound(draft) {
    draft = startNewTurn(draft);
    draft.currentTurn = 1;
	var nextRound = draft.common.round + 1;
	draft.common.round = nextRound;
	draft.secret[0].packIndex = (nextRound * 2) - 1;//1,3,5,7,etc
	draft.secret[1].packIndex = nextRound * 2;//2,4,6,8,etc
	draft.secret[0].pack = draft.packs[draft.secret[0].packIndex];//assign new pack
	draft.secret[1].pack = draft.packs[draft.secret[1].packIndex];//assign new pack
	return draft;
}

/**
 * Reset pick and burn counters for each player and increase the turn counter.
 */
function startNewTurn(draft) {
    draft.secret[0].picksThisTurn = 0;
    draft.secret[1].picksThisTurn = 0;
    draft.secret[0].burnsThisTurn = 0;
    draft.secret[1].burnsThisTurn = 0;
    draft.common.turn++;
	draft.secret[0].picking = true;
	draft.secret[1].picking = true;
	draft.secret[0].burning = false;
	draft.secret[1].burning = false;
	draft.secret[0].passing = false;
	draft.secret[1].passing = false;
    return draft;
}

function passPack(draft) {
    if (draft.secret[0].passing == true && draft.secret[1].passing == true) {
		//swap index
		var packIndexOne = draft.secret[0].packIndex;
		draft.secret[0].packIndex = draft.secret[1].packIndex;
		draft.secret[1].packIndex = packIndexOne;
		//swap packs
		draft.secret[0].pack = draft.packs[draft.secret[0].packIndex];
		draft.secret[1].pack = draft.packs[draft.secret[1].packIndex];
		
	    draft = startNewTurn(draft);
	} else {
	    //other pack not yet passed
	}
}

function getPlayerNumber(draft, socketName) {
    var result = -1;
    for (var i = 0; i < draft.sockets.length; i++) {
    	if (draft.sockets[i] && draft.sockets[i].name === socketName) {
    		result = i;
    		break;
    	}
    }
    return result;
}

module.exports = PickBurn;