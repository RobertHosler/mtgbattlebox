var DraftCreator = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        createDraft: createDraft.bind(this),
        joinDraft: joinDraft.bind(this)
    };
};

var MtgUtil = require('util/MtgUtil');

DraftCreator.draftTypes = [
    { 
        name: 'Winston',
        description: [
            'Take turns looking through 3 piles of cards refiled with the pool of extra cards.'
        ]},
    { 
        name: 'Grid', 
        description: [
            'Take turns picking a row or column from a grid of 9 cards.'
        ]},
    { 
        name: 'Pancake', 
        description: [
            '9 Rounds of 3 turns',
            'Pack size - 11 cards',
            'Turn 1 - Each player takes 1 card then passes the pack to the other player.',
            'Turn 2 - Each player takes 2 cards then burns 2 and passes back to the other player.',
            'Turn 3 - Each player takes 2 cards then discards the remaining card.',
            'Each player will draft 45 cards total.'
        ]}
];

function joinDraft(playerName, draftId) {
    var draft = this.app.drafts[draftId];
    //Add the player to the list and emit their secret part of the draft
    var socketIndex = isNew(draft, this.socket);
    if (socketIndex >= 0) {
        console.log("RejoinDraft", playerName, draftId);
        // this.socket.emit('draftUpdate', draft.public.id, draft.secret[socketIndex]); //notify individual player of secret draft update
    } else {
        console.log("JoinDraft", playerName, draftId);
        draft.public.players.push(this.socket.name);
        draft.sockets.push(this.socket);
    }
    this.socket.draftId = draftId;
    this.app.draftBroadcast(draft.public.id); 
    // this.app.broadcast('drafts', this.app.publicDrafts); //publish all public draft updates
}

function isNew(draft, socket) {
    var socketIndex = -1;
    for (var i = 0; i < draft.sockets.length; i++) {
        if (draft.sockets[i] && draft.sockets[i].name === socket.name) {
            //Already in the sockets list, replace
            draft.sockets[i] = socket;
            socketIndex = i;
            break;
        }
    }
    return socketIndex;
}

/**
 * Create a draft object and add it to the draft map using its unique id.
 * 
 * TODO: prevent players from creating multiple drafts
 */
function createDraft(playerName, draftType, cube) {
    console.log("CreateDraft", playerName, draftType.name, cube.name);
    let draft = {};
    if (draftType.name === "Grid") {
        draft = createGridDraft(cube);
    } else if (draftType.name === "Winston") {
        draft = createWinstonDraft(cube);
    } else if (draftType.name === "Pancake") {
        draft = createPancakeDraft(cube);
    } else if (draftType.name === "Winchester") {
        draft = createWinchesterDraft(cube);
    } else {
        draft = createBaseDraft(cube, 90);
        //Error - type not supported
    }
    let draftId = generateUniqueId(this.app);
    draft.public.id = draftId;
    draft.public.players.push(playerName);
    draft.public.type = draftType;
    draft.sockets = [this.socket]; //add socket as player one
    console.log("Draft Created", draftId, playerName, draftType.name, cube.name);
    this.socket.draftId = draftId;
    this.app.drafts[draftId] = draft; //map draft to draft id
    this.app.publicDrafts[draftId] = draft.public; //map draft to draft id
    this.app.draftBroadcast(draftId); //notify individual player of secret draft update
    // this.app.broadcast('drafts', this.app.publicDrafts); //publish all public draft updates
}

/**
 * Generate a unique id, by cross checking the random id with existing ids.
 * 
 * TODO: clear the ids at some point.
 */
function generateUniqueId(app) {
    let draftId;
    while (true) {
        draftId = (Math.random() + 1).toString(36).slice(2, 18);
        if (!app.drafts[draftId]) {
            break;
        }
    }
    return draftId;
}

function createBaseDraft(cube, poolSize) {
    var draft = {};
    draft.public = createDraftPublic(cube, poolSize);
    draft.secret = [createDraftSecret(0), createDraftSecret(1)];
    return draft;
}

function createDraftSecret(index) {
    var secret = {};
    secret.index = index;
    secret.deck = [];
    secret.sideboard = [];
    secret.opponentPool = [];
    return secret;
}

function createDraftPublic(cube, poolSize) {
    var shuffledCube = cube.cards.slice(); //make a copy of the cube
    MtgUtil.shuffle(shuffledCube); //shuffle it
    var public = {};
    public.poolSize = poolSize;
    //TODO: check if poolSize is larger than cube
    public.pool = shuffledCube.slice(0, poolSize);
    public.playerPools = [ [] , [] ];
    public.players = [];
    public.complete = false;
    public.creationTime = displayTime(new Date());
    public.cube = cube;
    return public;
}

function createGridDraft(cube, numGrids = 18, colSize = 3) {
    console.log("Creating Grid Draft", numGrids, colSize);
    var gridSize = colSize * colSize; //default is 9
    var poolSize = gridSize * numGrids; //default is 162
    var draft = createBaseDraft(cube, poolSize);
    //The maximum is exclusive and the minimum is inclusive
    draft.public.activePlayer = Math.floor((Math.random() * 2) + 1);
    draft.public.colSize = colSize;
    draft.public.gridSize = gridSize;
    draft.public.numGrids = numGrids;
    draft.grids = createGrids(draft.public.pool, numGrids, colSize);
    console.log("Starting grids", draft.grids);
    draft.public.gridNumber = 1;
    draft.public.turn = 1;
    draft.public.currentGrid = draft.grids[0]; //current grid is the only public grid.
    console.log("Starting grid", draft.public.currentGrid);
    draft.public.rowTaken;
    draft.public.colTaken;
    return draft;
}

var createGrids = function(pool, numGrids, colSize) {
    var grids = []; //grids is an array of grids
    for (var n = 0; n < numGrids; n++) {
        var grid = []; //grid is an array of rows
        for (var i = 0; i < colSize; i++) {
            var row = []; //row is an array of the cards in each column of that row
            for (var j = 0; j < colSize; j++) {
                row.push(pool.pop());
            }
            grid.push(row);
        }
        grids.push(grid);
    }
    return grids;
}

function createWinchesterDraft() {
    //The maximum is exclusive and the minimum is inclusive
    // draft.public.activePlayer = Math.floor((Math.random() * 2) + 1);
    
}

function createWinstonDraft(cube) {
    //The maximum is exclusive and the minimum is inclusive
    var poolSize = 15 * 6;//default is 6 packs of 15 cards, 90
    var draft = createBaseDraft(cube, poolSize);
    draft.public.activePlayer = Math.floor((Math.random() * 2) + 1);
    draft.piles = [];
    let thePile = draft.public.pool.slice();
    MtgUtil.shuffle(thePile);
    draft.piles[0] = thePile;
    draft.piles[1] = [draft.piles[0].pop()];
    draft.piles[2] = [draft.piles[0].pop()];
    draft.piles[3] = [draft.piles[0].pop()];
    draft.public.pileSizes = [];
    draft.public.pileSizes[0] = draft.piles[0].length;
    draft.public.pileSizes[1] = draft.piles[1].length;
    draft.public.pileSizes[2] = draft.piles[2].length;
    draft.public.pileSizes[3] = draft.piles[3].length;
    draft.public.activePile = 1;
    draft.secret[draft.public.activePlayer-1].pile = draft.piles[1];
    return draft;
}

function createPancakeDraft(cube) {
    var numPacks = 18;
    var packSize = 11;
    var picks = [0, 1, 2, 2];
    var burns = [0, 0, 2, 0];
    var turns = 3;
    var draft = createPickBurnDraft(cube, numPacks, packSize, picks, burns, turns);
    return draft;
}

function createBurnFourDraft(cube) {
    var numPacks = 24;
    var packSize = 15;
    var picks = [0, 1, 1, 1];
    var burns = [0, 4, 4, 0];
    var turns = 3;
    var draft = createPickBurnDraft(cube, numPacks, packSize, picks, burns, turns);
    return draft;
}

function createGlimpseDraft(cube) {
    var numPacks = 18;
    var packSize = 11;
    var picks = [0, 1, 1, 1, 1, 1];
    var burns = [0, 2, 2, 2, 2, 0];
    var turns = 5;
    var draft = createPickBurnDraft(cube, numPacks, packSize, picks, burns, turns);
    return draft;
}

function createPickBurnDraft(cube, numPacks, packSize, picks, burns, turns) {
    var poolSize = numPacks * packSize;
    var draft = createBaseDraft(cube, poolSize);
    var packs = buildPacks(draft.public.pool, packSize, numPacks);
    draft.packs = packs;
    draft.public.turn = 1;
    draft.public.turns = turns;
    draft.public.round = 1;
    draft.public.rounds = numPacks/2;
    draft.secret[0].packIndex = 1;//first player gets pack 1
    draft.secret[1].packIndex = 2;//second player gets pack 2
    draft.secret[0].pack = draft.packs[draft.secret[0].packIndex];
    draft.secret[1].pack = draft.packs[draft.secret[1].packIndex];
    draft.secret[0].picksThisTurn = 0;
    draft.secret[1].picksThisTurn = 0;
	draft.secret[0].picking = true;
	draft.secret[1].picking = true;
    draft.secret[0].burnsThisTurn = 0;
    draft.secret[1].burnsThisTurn = 0;
	draft.secret[0].burning = false;
	draft.secret[1].burning = false;
    draft.public.currentPicks = picks[draft.public.turn];//number of picks in the turn
    draft.public.currentBurns = burns[draft.public.turn];//number of burns in the turn
    draft.picks = picks;//number of picks on each turn in a round
    draft.burns = burns;//number of burns on each turn in a round
    draft.packSize = packSize;
    draft.numPacks = numPacks;
    return draft;
}

function buildPacks(pool, packSize, numPacks) {
     var packs = [""];//blank value to offset array
     for (var i = 0; i < numPacks; i++) {
        var pack = [];//create a pack
         for (var j = 0; j < packSize; j++) {
            pack.push(pool.pop());//add cards to pack
         }
         packs.push(pack);//add pack to packs list
     }
     return packs;
}

function displayTime(time) {
    var str = "";

    var hours = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var amPm = "";
    if (hours > 11) {
        amPm += "PM";
    }
    else {
        amPm += "AM";
    }
    if (hours > 12) {
        hours = hours - 12;
    }
    str += hours + ":" + minutes + ":" + seconds + " " + amPm;
    return str;
}

module.exports = DraftCreator;
