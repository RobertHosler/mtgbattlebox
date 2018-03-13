<?php
include 'draft_state.php';

//this file is called by the winston.js file
$function = $_POST['function'];
$response = array();

function removeCardFromPack($cardName, $pack) {
    $key = array_search($cardName, $pack); //find card key
    if ($key !== false) {
        unset($pack[$key]);//remove card
    } else {
    	//TODO: handle?
    }
    $pack = array_values($pack); //reindex the array so it will be interpretted as an array by javascript
    return $pack;
}

function startNewTurn($state) {
    $state['currentPack'][0] = "";
	$state['currentPicks'][1] = 0;
	$state['currentPicks'][2] = 0;
	$state['currentBurns'][1] = 0;
	$state['currentBurns'][2] = 0;
    $state['currentTurn'] = $state['currentTurn'] + 1;
    return $state;
}

function startNewRound($state) {
    $state = startNewTurn($state);
    $state['currentTurn'] = 1;
	$nextRound = $state['round'] + 1;
	$state['round'] = $nextRound;
	$state['currentPack'][1] = ($nextRound * 2) - 1;//1,3,5,7,etc
	$state['currentPack'][2] = $nextRound * 2;//2,4,6,8,etc
	return $state;
}

function endDraft($state, $playerNumber, $packIndex) {
    if ($state['currentPack'][0] == "") {
	    //other pack not yet passed
	    $state['currentPack'][0] = $packIndex;
	    $state['currentPack'][$playerNumber] = 0;
	    $state['draftComplete'] = true;
	} else {
        $state = startNewRound($state);
        $state['round'] = 0;
    	$state['currentPack'][1] = 0;
    	$state['currentPack'][2] = 0;
	}
    return $state;
}

function passPack($state, $playerNumber, $packIndex) {
    if ($state['currentPack'][0] == "") {
	    //other pack not yet passed
	    $state['currentPack'][0] = $packIndex;
	    $state['currentPack'][$playerNumber] = 0;
	} else {
	    //swap packs!
	    if ($playerNumber == 1) {
	        $state['currentPack'][1] = $state['currentPack'][0];
    	    $state['currentPack'][2] = $packIndex;
	    } else if ($playerNumber == 2) {
    	    $state['currentPack'][1] = $packIndex;
	        $state['currentPack'][2] = $state['currentPack'][0];
	    }
	    $state = startNewTurn($state);
	}
    return $state;	
}

switch ($function) {
	case ('burnCard'):
	    $draftName = $_POST['draftName'];
	    $playerNumber = $_POST['playerNumber'];
        $cardName = $_POST['cardName'];
	    $state = getDraftState($draftName);
	    //Remove card from pack
	    
        $packIndex = $state['currentPack'][$playerNumber];
        $pack = $state['packs'][$packIndex];
        $pack = removeCardFromPack($cardName, $pack);
        $state['packs'][$packIndex] = $pack;//set the pack without the card
        
        $currentTurn = $state['currentTurn'];
        $burnsInTurn = $state['burns'][$currentTurn];
        $currentBurns = $state['currentBurns'][$playerNumber] + 1;
        $state['currentBurns'][$playerNumber] = $currentBurns;
        $round = $state['round'];

        if ($currentBurns < $burnsInTurn) {
        	//make another burn choice
        	//handle in js
        } else {
        	$state = passPack($state, $playerNumber, $packIndex);
        }
	    
	    saveDraftFile($state);
	    $publicState = getPublicState($state, $playerNumber);
	    $response['state'] = $publicState;
	    break;
	    
	case ('pickCard'):
        $draftName = $_POST['draftName'];
        $playerNumber = $_POST['playerNumber'];
        $cardName = $_POST['cardName'];
        $state = getDraftState($draftName);
        //Remove card from pack and add to players deck
	    
        $packIndex = $state['currentPack'][$playerNumber];
        $pack = $state['packs'][$packIndex];
        $pack = removeCardFromPack($cardName, $pack);
        $state['packs'][$packIndex] = $pack;//set the pack without the card
        $state['decks'][$playerNumber][] = $cardName; //add to decklist
        
        $currentTurn = $state['currentTurn'];
        $picksInTurn = $state['picks'][$currentTurn];
        $burnsInTurn = $state['burns'][$currentTurn];
        $currentPicks = $state['currentPicks'][$playerNumber] + 1;
        $state['currentPicks'][$playerNumber] = $currentPicks;
        $round = $state['round'];

        if ($currentPicks < $picksInTurn) {
        	//make another pick
        	//handle in js
        } else if ($currentTurn == $state['turns']) {
			//last turn, no more picks
			//burn the rest of the pack and open a new pack if both players ready
            $state['packs'][$packIndex] = array();//set an empty array
            if ($round < $state['rounds']) {
                if ($state['currentPack'][0] == "") {
            	    //other pack not yet finished
            	    $state['currentPack'][0] = $packIndex;
            	    $state['currentPack'][$playerNumber] = 0;
                } else {
                    //Begin new round
                    $state = startNewRound($state);
                }
            } else {
		    	//TODO: handle last round
		    	$state = endDraft($state, $playerNumber, $packIndex);
            }
        } else if ($burnsInTurn > 0) {
          //switch to burning
          //handle in js
        } else {
        	$state = passPack($state, $playerNumber, $packIndex);
        }

	    saveDraftFile($state);
	    $publicState = getPublicState($state, $playerNumber);
	    $response['state'] = $publicState;
	    break;
}

echo json_encode($response); //response encoded as json object

?>

/* global $*/
/* global mtg*/
/* global draft*/
/* global draftName*/
/* global playerNumber*/

/*
State consists of 2 packs passed between two players.

198 Cards
18 packs of 11

9 Rounds
Round order:
Turn 1
Pick 1
Pass 10
Turn 2
Pick 1
Pick 1
Burn 1
Burn 1
Pass 6
Turn 3
Pick 2
Burn 4 (all the remaining)
*/

/**
 * Pancake draft is a draft format module that will be initialized and passed into a draft module.
 */
var pancake = (function() {
    
    var state;

	var startDraft = function() {
		
	};
    
    var pickCard = function(cardName) {
        if (!draft.instanse) {
			draft.instanse = true;
			$.ajax({
				type: "POST",
				url: "process/draft_pancake.php",
				data: {
					'function': 'pickCard',
					'draftName': draftName,
					'playerNumber': playerNumber,
					'cardName': cardName
				},
				dataType: "json",
				success: function(data) {
					pancake.state = data.state;
					draft.processDataChange(data.state);
					draft.instanse = false;
				}
			});
		}
		else {
			setTimeout(pickCard, 100);
		}
    };
    
    var burnCard = function(cardName) {
        if (!draft.instanse) {
			draft.instanse = true;
			$.ajax({
				type: "POST",
				url: "process/draft_pancake.php",
				data: {
					'function': 'burnCard',
					'draftName': draftName,
					'playerNumber': playerNumber,
					'cardName': cardName
				},
				dataType: "json",
				success: function(data) {
					pancake.state = data.state;
					draft.processDataChange(data.state);
					draft.instanse = false;
				}
			});
		}
		else {
			setTimeout(burnCard, 100);
		}
    };
	
	var isStateUpdated = function(_state) {
		return pancake.state.players.length != _state.players.length
			|| pancake.state.currentTurn != _state.currentTurn
			|| pancake.state.round != _state.round
			|| pancake.state.currentPack[playerNumber] != _state.currentPack[playerNumber];
	};
    
	var	processDataChange = function(state) {
		$(".currentPile").removeClass("burning");
		$(".currentPile").removeClass("picking");
		var picksInTurn = state.picks[state.currentTurn];
		var burnsInTurn = state.burns[state.currentTurn];
        var currentPicks = state.currentPicks[playerNumber];
        var currentBurns = state.currentBurns[playerNumber];
        if (state.draftComplete) {
			$("#draftComplete").show();
			$("#currentPileRow").hide();
        } else {
			if (currentPicks < picksInTurn) {
				var pickNum = picksInTurn - currentPicks;
				$(".currentPile").addClass("picking");
				$("#currentPileNumber").html("Pick " + mtg.cardCountString(pickNum));
			} else if (currentBurns < burnsInTurn) {
				var burnNum = burnsInTurn - currentBurns;
				$(".currentPile").addClass("burning");
				$("#currentPileNumber").html("Burn " + mtg.cardCountString(burnNum));
			} else {
				$("#currentPileNumber").html("Waiting for other player");
			}
        }
        updateStatusMessage(state);
	};
	
	var updateStatusMessage = function(state) {
		if (state.draftComplete) {
			$("#statusCurrentRound").hide();
			$("#statusCurrentTurn").hide();
		} else {
			$("#statusCurrentRound").html("Round: " + state.round);
			$("#statusCurrentTurn").html("Turn: " + state.currentTurn);
		}
	};

	return {
		state: state,
		startDraft: startDraft,
		processDataChange: processDataChange,
		updateStatusMessage: updateStatusMessage,
		isStateUpdated: isStateUpdated,
		burnCard: burnCard,
		pickCard: pickCard
	};
})();