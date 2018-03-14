module.exports = (function() {
    
    var BaseDraft = require('model/Draft');
    
    var createDraft = function(cube, numGrids = 18, colSize = 3) {
        var gridSize = colSize * colSize;//default is 9
        var poolSize = gridSize * numGrids//default is 162
        var draft = BaseDraft.createDraft(cube, poolSize);
        draft.public.colSize = colSize;
        draft.public.gridSize = gridSize;
        draft.public.numGrids = numGrids;
        draft.secret[0].grids = createGrids(draft.pool, draft.numGrids, draft.colSize);
        draft.public.gridNumber = 1;
        draft.public.currentGrid = draft.secret[0].grids[draft.public.gridNumber];//current grid is the only public grid.
        draft.public.rowTaken;
        draft.public.colTaken;
        return draft;
    }
    
    var createGrids = function(pool, numGrids, colSize) {
         var grids = [];//grids is an array of grids
         for (var n = 0; n < numGrids; n++) {
            var grid  = [];//grid is an array of rows
            for (var i = 0; i < colSize; i++) {
                var row = [];//row is an array of the cards in each column of that row
                for (var j = 0; j < colSize; j++) {
                    row.push(pool.pop());
                }
                grid.push(row);
            }
            grids.push(grid);
         }
        return grids;
    }
    
    return {
		createDraft: createDraft
	};
})();


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
