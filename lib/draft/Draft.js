<?php
include 'draft_state.php';

//this file is called by the draft.js file
$function = $_POST['function'];
$response = array();

/**
 * Unused
 */
function make_unique($full_path) {
    $file_name = basename($full_path);
    $directory = dirname($full_path) . DIRECTORY_SEPARATOR;
    
    $i = 2;
    while (file_exists($directory . $file_name)) {
        $parts = explode('.', $file_name);
        // Remove any numbers in brackets in the file name
        $parts[0] = preg_replace('/\(([0-9]*)\)$/', '', $parts[0]);
        $parts[0] .= '(' . $i . ')';
        
        $new_file_name = implode('.', $parts);
        if (!file_exists($new_file_name)) {
            $file_name = $new_file_name;
        }
        $i++;
    }
    return $directory . $file_name;
}

function startDraft() {
    $response = array();
    $cubeName = $_POST['cubeName'];
    $draftName = $_POST['draftName'];
    $draftType = $_POST['draftType'];
    $fileName = $_POST['fileName'];
    $playerName = $_POST['playerName'];
    $state = getDraftState($draftName);
    if ($state == null) {
        //Create new state
        $state = initState($draftName, $cubeName, $draftType);
    }
    $state['players'] = joinDraft($state['players'], $playerName);
    $playerNumber = getPlayerNumber($state['players'], $playerName);
    saveDraftFile($state);
    $response['state'] = getPublicState($state, $playerNumber); //sends the state object back
    $response['playerNumber'] = $playerNumber;
    return $response;
}

function restartDraft() {
    $response = array();
    $cubeName = $_POST['cubeName'];
    $draftName = $_POST['draftName'];
    $draftType = $_POST['draftType'];
    $fileName = $_POST['fileName'];
    $playerName = $_POST['playerName'];
    //Create new state
    $state = initState($draftName, $cubeName, $draftType);
    $state['players'] = joinDraft($state['players'], $playerName);
    $playerNumber = getPlayerNumber($state['players'], $playerName);
    saveDraftFile($state);
    $response['state'] = getPublicState($state, $playerNumber); //sends the state object back
    $response['playerNumber'] = $playerNumber;
    return $response;
}

switch ($function) {
    case ('startDraft'):
        $response = startDraft();
        break;
        
    case ('restartDraft'):
        $response = restartDraft();
        break;
    
    case ('update'):
        $draftName = $_POST['draftName'];
        $playerNumber = $_POST['playerNumber'];
        $state = getDraftState($draftName);
        $response['state'] = getPublicState($state, $playerNumber); //decode into an object
        break;
    
    case ('saveDeck'):
        $draftName = $_POST['draftName'];
        $state = getDraftState($draftName);
        $playerNumber = $_POST['playerNumber'];
        $deckFileName = $_POST['deckFileName'];
        $deck = isset($state['decks'][$playerNumber]) ? $state['decks'][$playerNumber] : array();
        $sideboard = isset($state['sideboard'][$playerNumber]) ? $state['sideboard'][$playerNumber] : array();
        saveDeckAndSideboardToFile($deck, $sideboard, $deckFileName);
        break;
    
    case ('listDrafts'):
        $drafts = retrieveAllDrafts();
        $states = array();
        foreach ($drafts as $draft) {
            $state = retrieveDraftFile($draft);
            $states[] = $state;
        }
        $response['drafts'] = $drafts;
        $response['states'] = $states;
        break;
    
    case ('listCubes'):
        $response['cubes'] = retrieveAllCubes();
        break;
        
    case ('addCubeList'):
        $cubeName = $_POST['cubeName'];
        $cubeList = $_POST['cubeList'];
        saveCubeToFile($cubeName, $cubeList);
        $response['cubes'] = retrieveAllCubes();
        $response['cubeList'] = retrieveCubeList($cubeName);
        break;
        
    case ('retrieveCubeList'):
        $cubeName = $_POST['cubeName'];
        $response['cubeList'] = retrieveCubeList($cubeName);
        break;
    
    case ('moveToSideboard'):
        $draftName = $_POST['draftName'];
        $state = getDraftState($draftName);
        $cardName = $_POST['cardName'];
        $playerNumber = $_POST['playerNumber'];
        $deckList = $state['decks'][$playerNumber];
        $key = array_search($cardName, $deckList); //find card key
        if ($key !== false) {
            unset($deckList[$key]);
        } //remove card
        $deckList = array_values($deckList); //resort the array so it will be interpretted as an array by javascript
        $state['decks'][$playerNumber] = $deckList; //set the list
        $state['sideboard'][$playerNumber][] = $cardName; //add to sideboard
        saveDraftFile($state);
        $response['state'] = getPublicState($state, $playerNumber);
        break;
    
    case ('moveToDeck'):
        $draftName = $_POST['draftName'];
        $state = getDraftState($draftName);
        $cardName = $_POST['cardName'];
        $playerNumber = $_POST['playerNumber'];
        $sideboard = $state['sideboard'][$playerNumber];
        $key = array_search($cardName, $sideboard); //find card key
        if ($key !== false) {
            unset($sideboard[$key]);
        } //remove card
        $sideboard = array_values($sideboard); //reindex the array so it will be interpretted as an array by javascript
        $state['sideboard'][$playerNumber] = $sideboard; //set the sideboard without the card
        $state['decks'][$playerNumber][] = $cardName; //add to decklist
        saveDraftFile($state);
        $response['state'] = getPublicState($state, $playerNumber);
        break;
    
    case ('deleteDrafts'):
        $password = $_POST['password'];
        $response['passwordValid'] = false;
        if ($password == "sleepygirl") {
            $files = glob(getDraftsPath() . "/*"); // get all file names
            foreach($files as $file){ // iterate files
              if(is_file($file))
                unlink($file); // delete file
            }
            $response['passwordValid'] = true;
        }
        break;
        
}

echo json_encode($response); //response encoded as json object
 
?>

<?php
include 'draft_state.php';

//this file is called by the draft.js file
$function = $_POST['function'];
$response = array();

/**
 * Unused
 */
function make_unique($full_path) {
    $file_name = basename($full_path);
    $directory = dirname($full_path) . DIRECTORY_SEPARATOR;
    
    $i = 2;
    while (file_exists($directory . $file_name)) {
        $parts = explode('.', $file_name);
        // Remove any numbers in brackets in the file name
        $parts[0] = preg_replace('/\(([0-9]*)\)$/', '', $parts[0]);
        $parts[0] .= '(' . $i . ')';
        
        $new_file_name = implode('.', $parts);
        if (!file_exists($new_file_name)) {
            $file_name = $new_file_name;
        }
        $i++;
    }
    return $directory . $file_name;
}

function startDraft() {
    $response = array();
    $cubeName = $_POST['cubeName'];
    $draftName = $_POST['draftName'];
    $draftType = $_POST['draftType'];
    $fileName = $_POST['fileName'];
    $playerName = $_POST['playerName'];
    $state = getDraftState($draftName);
    if ($state == null) {
        //Create new state
        $state = initState($draftName, $cubeName, $draftType);
    }
    $state['players'] = joinDraft($state['players'], $playerName);
    $playerNumber = getPlayerNumber($state['players'], $playerName);
    saveDraftFile($state);
    $response['state'] = getPublicState($state, $playerNumber); //sends the state object back
    $response['playerNumber'] = $playerNumber;
    return $response;
}

function restartDraft() {
    $response = array();
    $cubeName = $_POST['cubeName'];
    $draftName = $_POST['draftName'];
    $draftType = $_POST['draftType'];
    $fileName = $_POST['fileName'];
    $playerName = $_POST['playerName'];
    //Create new state
    $state = initState($draftName, $cubeName, $draftType);
    $state['players'] = joinDraft($state['players'], $playerName);
    $playerNumber = getPlayerNumber($state['players'], $playerName);
    saveDraftFile($state);
    $response['state'] = getPublicState($state, $playerNumber); //sends the state object back
    $response['playerNumber'] = $playerNumber;
    return $response;
}

switch ($function) {
    case ('startDraft'):
        $response = startDraft();
        break;
        
    case ('restartDraft'):
        $response = restartDraft();
        break;
    
    case ('update'):
        $draftName = $_POST['draftName'];
        $playerNumber = $_POST['playerNumber'];
        $state = getDraftState($draftName);
        $response['state'] = getPublicState($state, $playerNumber); //decode into an object
        break;
    
    case ('saveDeck'):
        $draftName = $_POST['draftName'];
        $state = getDraftState($draftName);
        $playerNumber = $_POST['playerNumber'];
        $deckFileName = $_POST['deckFileName'];
        $deck = isset($state['decks'][$playerNumber]) ? $state['decks'][$playerNumber] : array();
        $sideboard = isset($state['sideboard'][$playerNumber]) ? $state['sideboard'][$playerNumber] : array();
        saveDeckAndSideboardToFile($deck, $sideboard, $deckFileName);
        break;
    
    case ('listDrafts'):
        $drafts = retrieveAllDrafts();
        $states = array();
        foreach ($drafts as $draft) {
            $state = retrieveDraftFile($draft);
            $states[] = $state;
        }
        $response['drafts'] = $drafts;
        $response['states'] = $states;
        break;
    
    case ('listCubes'):
        $response['cubes'] = retrieveAllCubes();
        break;
        
    case ('addCubeList'):
        $cubeName = $_POST['cubeName'];
        $cubeList = $_POST['cubeList'];
        saveCubeToFile($cubeName, $cubeList);
        $response['cubes'] = retrieveAllCubes();
        $response['cubeList'] = retrieveCubeList($cubeName);
        break;
        
    case ('retrieveCubeList'):
        $cubeName = $_POST['cubeName'];
        $response['cubeList'] = retrieveCubeList($cubeName);
        break;
    
    case ('moveToSideboard'):
        $draftName = $_POST['draftName'];
        $state = getDraftState($draftName);
        $cardName = $_POST['cardName'];
        $playerNumber = $_POST['playerNumber'];
        $deckList = $state['decks'][$playerNumber];
        $key = array_search($cardName, $deckList); //find card key
        if ($key !== false) {
            unset($deckList[$key]);
        } //remove card
        $deckList = array_values($deckList); //resort the array so it will be interpretted as an array by javascript
        $state['decks'][$playerNumber] = $deckList; //set the list
        $state['sideboard'][$playerNumber][] = $cardName; //add to sideboard
        saveDraftFile($state);
        $response['state'] = getPublicState($state, $playerNumber);
        break;
    
    case ('moveToDeck'):
        $draftName = $_POST['draftName'];
        $state = getDraftState($draftName);
        $cardName = $_POST['cardName'];
        $playerNumber = $_POST['playerNumber'];
        $sideboard = $state['sideboard'][$playerNumber];
        $key = array_search($cardName, $sideboard); //find card key
        if ($key !== false) {
            unset($sideboard[$key]);
        } //remove card
        $sideboard = array_values($sideboard); //reindex the array so it will be interpretted as an array by javascript
        $state['sideboard'][$playerNumber] = $sideboard; //set the sideboard without the card
        $state['decks'][$playerNumber][] = $cardName; //add to decklist
        saveDraftFile($state);
        $response['state'] = getPublicState($state, $playerNumber);
        break;
    
    case ('deleteDrafts'):
        $password = $_POST['password'];
        $response['passwordValid'] = false;
        if ($password == "sleepygirl") {
            $files = glob(getDraftsPath() . "/*"); // get all file names
            foreach($files as $file){ // iterate files
              if(is_file($file))
                unlink($file); // delete file
            }
            $response['passwordValid'] = true;
        }
        break;
        
}

echo json_encode($response); //response encoded as json object
 
?>