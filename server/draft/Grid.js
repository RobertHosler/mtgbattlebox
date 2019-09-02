var Grid = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        draftCol: draftCol.bind(this),
        draftRow: draftRow.bind(this)
    };
};

function draftRow(index) {
    console.log("Draft Row", this.socket.draftId);
    var draft = this.app.drafts[this.socket.draftId];
    if (!draft) {
        return;
    }
    var activePlayer = draft.common.activePlayer;
    var socketIndex = activePlayer-1;
    if (isActivePlayer(draft, socketIndex, this.socket.name)) {
        console.log("Good socket", this.socket.name);
        var draftedCards = [];
        for (var i = 0; i < 3; i++) {
            var card = draft.common.currentGrid[index][i];
            if (card) {
                draftedCards.push(card);
            }
            draft.common.currentGrid[index][i] = '';
        }
        if (draftedCards.length === 0) {
            console.log("Can't draft zero cards");
            return;//don't let someone draft zero cards
        }
        console.log("DraftedCards:", draftedCards);
        draftCards(draft, draftedCards);
        incrementTurn(draft);
        this.app.draftBroadcast(draft.common.id);
    } else {
        //hey you aren't allowed in here!
        console.log("Bad socket", this.socket.name);
    }
}

function draftCol(index) {
    console.log("Draft Col", this.socket.draftId);
    var draft = this.app.drafts[this.socket.draftId];
    if (!draft) {
        return;
    }
    var activePlayer = draft.common.activePlayer;
    var socketIndex = activePlayer-1;
    if (isActivePlayer(draft, socketIndex, this.socket.name)) {
        console.log("Good socket", this.socket.name);
        var draftedCards = [];
        for (var i = 0; i < 3; i++) {
            var card = draft.common.currentGrid[i][index];
            if (card) {
                draftedCards.push(card);
                draft.common.currentGrid[i][index] = '';
            }
        }
        if (draftedCards.length === 0) {
            return;//don't let someone draft zero cards
        }
        console.log("DraftedCards:", draftedCards);
        draftCards(draft, draftedCards);
        incrementTurn(draft);
        this.app.draftBroadcast(draft.common.id);
    } else {
        //hey you aren't allowed in here!
        console.log("Bad socket", this.socket.name);
    }
}

/**
 * Check if the socket is the active player
 */
function isActivePlayer(draft, socketIndex, socketName) {
    var result = false;
    if (draft.sockets.length > socketIndex
            && draft.sockets[socketIndex]
            && draft.sockets[socketIndex].name === socketName) {
        result = true;
    }
    return result;
}

/**
 * Add cards to player's pool and deck
 */
function draftCards(draft, draftedCards) {
    var activePlayer = draft.common.activePlayer;
    var index = activePlayer-1;
    draft.common.playerPools[index] = draft.common.playerPools[index].concat(draftedCards);
    draft.secret[index].deck = draft.secret[index].deck.concat(draftedCards);
    // console.log("Deck", draft.secret[index].deck);
}

function incrementTurn(draft) {
    if (draft.common.turn === 1) {
        draft.common.turn++;
        draft.common.activePlayer = draft.common.activePlayer === 1 ? 2 : 1;
    } else if (draft.common.turn === 2) {
        draft.common.turn = 1;
        draft.common.gridNumber++;
        if (draft.common.gridNumber > draft.common.numGrids) {
            //Draft is over!
            draft.common.complete = true;
        } else {
            //New Grid
            draft.common.currentGrid = draft.grids[draft.common.gridNumber-1];
            console.log("New grid", draft.common.currentGrid);
        }
    }
}

/*
//this file is called by the winston.js file
$function = $_POST['function'];
$response = array();

function changeTurn($state, $playerNumber) {
    //change the active player or reset turn values for new round
    if ($state['turn'] == 1) {
        $state['turn'] = 2;
		$state['activePlayer'] = ($playerNumber == 1) ? 2 : 1;
    } else if ($state['turn'] == 2) {
        //active player stays the same since players take turns going first in a round
        if ($state['currentGrid'] == $state['numGrids']) {
            $state['draftComplete'] = true;
        } else {
            $state['turn'] = 1;
            $state['currentGrid'] = $state['currentGrid'] + 1;
        }
        $state['rowTaken'] = -1;
        $state['colTaken'] = -1;
    }
    return $state;
}

function addRowToDeck($state, $playerNumber, $rowNum) {
    //Add all cards in a given row to active players deck
    $currentGrid = $state['currentGrid'];
    $colSize = $state['colSize'];
    $cards = array();
    for ($i = 0; $i < $colSize; $i++) {
        $card = $state['grids'][$currentGrid][$rowNum][$i];
        if ($card != "") {//ignore if empty slot
            $state['decks'][$playerNumber][] = $card;//add card
            $state['playerPools'][$playerNumber][] = $card;//add card
            $state['grids'][$currentGrid][$rowNum][$i] = "";//clear card from grid
        }
    }
    $state['rowTaken'] = $rowNum;
    return $state;
}

function addColToDeck($state, $playerNumber, $colNum) {
    //Add all cards in a given column to active players
    $currentGrid = $state['currentGrid'];
    $colSize = $state['colSize'];
    $cards = array();
    for ($i = 0; $i < $colSize; $i++) {
        $card = $state['grids'][$currentGrid][$i][$colNum];
        if ($card != "") {//ignore if empty slot
            $state['decks'][$playerNumber][] = $card;//add card to decklist
            $state['playerPools'][$playerNumber][] = $card;//add card
            $state['grids'][$currentGrid][$i][$colNum] = "";//clear card from grid
        }
    }
    $state['colTaken'] = $colNum;
    return $state;
}

switch ($function) {
	case ('pickCol'):
        $draftName = $_POST['draftName'];
        $playerNumber = $_POST['playerNumber'];
        $colNum = $_POST['colNum'];
        $state = getDraftState($draftName);
        $state = addColToDeck($state, $playerNumber, $colNum);
        $state = changeTurn($state, $playerNumber);
	    saveDraftFile($state);
	    $publicState = getPublicState($state, $playerNumber);
	    $response['state'] = $publicState;
	    break;
	    
	case ('pickRow'):
        $draftName = $_POST['draftName'];
        $playerNumber = $_POST['playerNumber'];
        $rowNum = $_POST['rowNum'];
        $state = getDraftState($draftName);
        $state = addRowToDeck($state, $playerNumber, $rowNum);
        $state = changeTurn($state, $playerNumber);
	    saveDraftFile($state);
	    $publicState = getPublicState($state, $playerNumber);
	    $response['state'] = $publicState;
	    break;
}

*/

module.exports = Grid;
