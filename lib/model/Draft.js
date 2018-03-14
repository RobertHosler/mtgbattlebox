//Draft should contain public and private info

//Public is visible with everyone on the server, name and type of draft, turn, cards remaining
//Private is information only known to certain players, ex: the contents of their deck's

// var Draft = {};
// Draft.publicInfo = {};
// Draft.playersInfo = [];

// var playerInfo = {};
// //create new playerInfo for each
// Draft.playersInfo[0] = {};
// Draft.playersInfo[1] = {};

// Draft.log = function() {
//     console.log('Logging from Draft!');
// }

// module.exports = Draft;

module.exports = (function() {
    
    var MtgUtil = require('util/MtgUtil');
    
    var createDraft = function(cube, poolSize) {
        var draft = {};
        draft.public = createDraftPublic();
        draft.secret = [{}, createDraftSecret(), createDraftSecret()];
    }
    
    var createDraftSecret = function() {
        var secret = {};
        secret.deck = [];
        secret.sideboard = [];
        secret.pool = [];
        return secret;
    }
    
    var createDraftPublic = function(cube, poolSize) {
        var shuffledCube = cube.slice();//make a copy of the cube
        MtgUtil.shuffle(shuffledCube);//shuffle it
        var public = {};
        public.poolSize = poolSize;
        public.activePlayer = Math.floor((Math.random() * 2) + 1);//The maximum is exclusive and the minimum is inclusive
        public.pool = shuffledCube.slice(0, poolSize);//TODO: check if poolSize is larger than cube
        public.playerPools = ['', [], []];
        public.draft.players = [''];
        public.turn = 1;
        public.complete = false;
        return public;
    }
    
    return {
		createDraft: createDraft
	};
})();

/*
     //Save decklist and sideboard to file.
    function saveDeckAndSideboardToFile($deck, $sideboard, $file_name) {
        $fileContents = array();
        for ($i = 0; $i < count($deck); $i++) {
            $fileContents[] = "1 ".$deck[$i];
        }
        for ($i = 0; $i < count($sideboard); $i++) {
            $fileContents[] = "SB: 1 ".$sideboard[$i];
        }
        error_log("Saving deck to file: ".$_SERVER['DOCUMENT_ROOT'].$file_name);
        file_put_contents($_SERVER['DOCUMENT_ROOT'].$file_name, implode("\r\n", $fileContents));
    }
    
     * Extracted code from start draft.
     * 
     * Check draft state for if 
    function joinDraft($players, $playerName) {
        $playerNumber = array_search($playerName, $players);
        if ($playerNumber === false) {
            //player joined game - add to players list
            $players[] = $playerName;//add to players array
        } else {
            //player rejoined, already in players list
        }
        return $players;
    }

    function initState($draftName, $cubeName, $draftType) {
        error_log("Creating ".$draftType." draft");
        if(file_exists(getCubesPath()."/".$cubeName.".txt")){
            $cube = file(getCubesPath()."/".$cubeName.".txt", FILE_IGNORE_NEW_LINES);//file reads a file into an array
            shuffle($cube);
            switch ($draftType) {
                case ('winston'):
                    return initWinstonState($draftName, $cubeName, $cube, 90);
                    break;
                case ('winston100')://ten extra cards
                    return initWinstonState($draftName, $cubeName, $cube, 100);
                    break;
                case ('pancake'):
                    return initPancakeState($draftName, $cubeName, $cube);
                    break;
                case ('burnfour'):
                    return initBurnFourState($draftName, $cubeName, $cube);
                    break;
                case ('glimpse'):
                    return initGlimpseState($draftName, $cubeName, $cube);
                    break;
                case ('grid'):
                    return initGridState($draftName, $cubeName, $cube, 18);
                    break;
                case ('grid20'):
                    return initGridState($draftName, $cubeName, $cube, 20);
                    break;
                case ('winchester'):
                    return initWinchesterState($draftName, $cubeName, $cube, 92);
                    break;
                case ('winchester100')://three extra flips
                    return initWinchesterState($draftName, $cubeName, $cube, 100);
                    break;
            }
        } else {
             //What to do if the cube doesn't exist?  Retry with default_cube.txt
             //TODO notify user that default cube was used... somehow
            $cubeName = 'default_cube';
            return initState($draftName, $cubeName, $draftType);
         }
    }
    
    
    
     * Convert the state object into a publicly viewable version
    function getPublicState($state, $playerNumber) {
        switch ($state['format']) {
            case 'winston':
            case 'winston100':
                $state = getActivePlayerState($state, $playerNumber);
                $state = getPublicWinstonState($state, $playerNumber);
                break;
            case 'pancake':
            case 'glimpse':
            case 'burnfour':
                $state = getPublicPancakeState($state, $playerNumber);
                break;
            case 'grid':
            case 'grid20':
                $state = getActivePlayerState($state, $playerNumber);
                $state = getPublicGridState($state, $playerNumber);
                break;
        }
        $state = getPublicDeckState($state, $playerNumber);
        $state['draftLock'] = null;
        return $state;
    }
    
    function getActivePlayerState($state, $playerNumber) {
		$isActivePlayer = false;
        $activePlayer = $state['activePlayer'];
        if ($playerNumber == $activePlayer) {
            $isActivePlayer = true;
        }
        $state['isActivePlayer'] = $isActivePlayer;
        $state['activePlayerName'] = $state['players'][$activePlayer - 1];
        return $state;
    }
    
    function getPublicDeckState($state, $playerNumber) {
        for ($i = 0; $i < count($state['decks']); $i++) {
            if ($i != $playerNumber) {
                $state['decks'][$i] = "";
                $state['sideboard'][$i] = "";
            }
        }
        return $state;
    }
    
    function getPublicWinstonState($state, $playerNumber) {
        //clean piles - convert them to length of pile
        if ($playerNumber == $state['activePlayer']) {
            $state['activePile'] = $state['piles'][$state['currentPile']];//set activePile to visible pile
        }
        $state['piles'][0] = count($state['piles'][0]);
        $state['piles'][1] = count($state['piles'][1]);
        $state['piles'][2] = count($state['piles'][2]);
        $state['piles'][3] = count($state['piles'][3]);
        return $state;		
    }
    
    function getPublicPancakeState($state, $playerNumber) {
        // error_log("playerNumber: ".$playerNumber);
        $currentPack = $state['currentPack'][$playerNumber];
        // error_log("currentPack: ".$currentPack);
        $state['activePile'] = $state['packs'][$currentPack];//set activePile to visible pack
        $state['packs'] = "";
        return $state;
    }
    
    function getPublicGridState($state, $playerNumber) {
        $currentGrid = $state['currentGrid'];
        $state['activeGrid'] = $state['grids'][$currentGrid];//set activeGrid to current visible grid
        $state['grids'] = "";//hide the rest of the grids
        return $state;
    }
    
    function isDraftOver($state) {
        $draftOver = true;
        //if the piles still have cards, draft isn't over
        foreach ($state['piles'] as $pile) {
            //if the pile is empty, the draft may be over so we should keep looking at the piles
            if (!empty($pile)) {
                //if the pile is not empty, the draft should continue
                $draftOver = false;
                break;
            }
        }
        return $draftOver;
    }
    
    function getPlayerNumber($players, $playerName) {
        $playerNumber = array_search($playerName, $players);
        if ($playerNumber === false) {
            $playerNumber = -1;
        } else {
            $playerNumber++;
        }
        return $playerNumber;
    }
    
    function retrieveDraftFile($fileName) {
        $draftsPath = getDraftsPath();
        return retrieveStateFromFile($draftsPath."/".$fileName);
    }
    
    function saveDraftFile($state) {
        $draftsPath = getDraftsPath();
        writeStateToFile($state, $draftsPath."/".$state['fileName']);
    }
    
    function draftLastChange($fileName) {
        $draftsPath = getDraftsPath();
        return filectime($draftsPath."/".$fileName);
    }
    
    function retrieveAllDrafts() {
        // $draftsPath = getDraftsPath();
        // $allDrafts = scandir($draftsPath);
        // return $allDrafts;
        return retrieveAllFiles(getDraftsPath());
    }
    
    function retrieveAllCubes() {
        return retrieveAllFiles(getCubesPath());
    }
    
    function retrieveAllFiles($path) {
        $allFiles = scandir($path);
        $files = array_diff($allFiles, array(
            '.',
            '..',
            '.gitignore'
        ));
        return $files;
    }
    
    function doesDraftExist($draftName) {
        $draftsPath = getDraftsPath();
        return file_exists($draftsPath."/".$draftName);
    }
    
    function getDraftState($draftName) {
        $state = null;
        // error_log("Getting draft state for: ".getDraftsPath()."/".$state_file_name);
        if (file_exists(getDraftPath($draftName))) {
            //Draft already exists, retrieve from file
            $filePath = getDraftPath($draftName);
            $f = fopen($filePath, 'r');
            flock($f, LOCK_EX);
            $jsonString = file_get_contents($filePath);
            // error_log("State in file: ".$jsonString);
            fclose($f);
            $state = json_decode($jsonString, true);
            $state['draftLock'] = true;
        }
        return $state;
    }

     *	Converts state to json and writes to file
    function writeStateToFile($state, $filePath) {
        $json = json_encode($state);
        // error_log("State to be saved: ".$json);
        if (isSet($state['draftLock'])) {
            $f = fopen($filePath, 'w');
            fwrite($f, $json);
            flock($f, LOCK_UN);
            fclose($f);
        } else {
            //no lock, just put contents, this will happen when first created
            file_put_contents($filePath, $json);//overwrite content
        }
    }
    
    function retrieveStateFromFile($filePath) {
        // error_log("Retrieve state from: ".$filePath);
        $jsonString = file_get_contents($filePath);
        // error_log("State in file: ".$jsonString);
        $json = json_decode($jsonString, true);
        return $json;
    }
    
    $_draftsPath;
    $_cubesPath;
    
    function getDraftsPath() {
        if ($_draftsPath == null) {
            $webPath = $_SERVER['DOCUMENT_ROOT']; //path to /web
            $appPath = dirname($webPath);
            $_draftsPath = $appPath."/data/drafts";
            // error_log("_draftsPath=".$_draftsPath);
        }
        return $_draftsPath;
    }
    
    function getDraftPath($draftName) {
        return getDraftsPath()."/".$draftName;
    }
    
    function getCubesPath() {
        if ($_cubesPath == null) {
            $webPath = $_SERVER['DOCUMENT_ROOT']; //path to /web
            $appPath = dirname($webPath); //path to root of app
            $_cubesPath = $appPath."/data/cubes";//append path to cubes dir
            // error_log("$_cubesPath=".$_cubesPath);
        }
        return $_cubesPath;
    }
    
?>
*/