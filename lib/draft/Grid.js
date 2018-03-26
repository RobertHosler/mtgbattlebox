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
    var activePlayer = draft.public.activePlayer;
    if (draft.sockets.length > activePlayer-1 
            && draft.sockets[activePlayer-1].name === this.socket.name) {
        console.log("Good socket", this.socket.name);
        //TODO: check that socket is active player
        var draftedCards = [];
        for (var i = 0; i < 3; i++) {
            draftedCards.push(draft.public.currentGrid[index][i]);
            draft.public.currentGrid[index][i] = '';
        }
        incrementTurn(draft);
        console.log("DraftedCards:", draftedCards);
        draft.public.playerPools[activePlayer-1] = draft.public.playerPools[activePlayer-1].concat(draftedCards);
        draft.secret[activePlayer-1].deck = draft.secret[activePlayer-1].deck.concat(draftedCards);
        this.app.broadcast('drafts', this.app.publicDrafts);
        this.socket.emit('draftUpdate', draft.public.id, draft.secret[activePlayer-1]);
    } else {
        //hey you aren't allowed in here!
        console.log("Bad socket", this.socket.name);
    }
}

function draftCol(index) {
    console.log("Draft Col", this.socket.draftId);
    var draft = this.app.drafts[this.socket.draftId];
    var activePlayer = draft.public.activePlayer;
    if (draft.sockets.length > activePlayer-1 
            && draft.sockets[activePlayer-1].name === this.socket.name) {
        console.log("Good socket", this.socket.name);
        //TODO: check that socket is active player
        var draftedCards = [];
        for (var i = 0; i < 3; i++) {
            draftedCards.push(draft.public.currentGrid[i][index]);
            draft.public.currentGrid[i][index] = '';
        }
        incrementTurn(draft);
        console.log("DraftedCards:", draftedCards);
        draft.public.playerPools[activePlayer-1] = draft.public.playerPools[activePlayer-1].concat(draftedCards);
        draft.secret[activePlayer-1].deck = draft.secret[activePlayer-1].deck.concat(draftedCards);
        this.app.broadcast('drafts', this.app.publicDrafts);
        this.socket.emit('draftUpdate', draft.public.id, draft.secret[activePlayer-1]);
    } else {
        //hey you aren't allowed in here!
        console.log("Bad socket", this.socket.name);
    }
}

function incrementTurn(draft) {
    if (draft.public.turn === 1) {
        draft.public.turn++;
        draft.public.activePlayer = draft.public.activePlayer === 1 ? 2 : 1;
    } else if (draft.public.turn === 2) {
        draft.public.turn = 1;
        draft.public.gridNumber++;
        if (draft.public.gridNumber > draft.public.numGrids) {
            //Draft is over!
            draft.public.complete = true;
        } else {
            //New Grid
            draft.public.currentGrid = draft.grids[draft.public.gridNumber-1]
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
