import { shuffle } from 'util/MtgUtil';

class DraftCreator {

    constructor(app, socket) {
        this.app = app;
        this.socket = socket;

        // Expose handler methods for events
        this.handler = {
            // use the bind function to access this.app and this.socket in events
            createDraft: createDraft.bind(this),
            joinDraft: joinDraft.bind(this)
        };

    }

    static draftTypes() {
        return [
                { 
                    name: 'Winston',
                    description: [
                        'Take turns looking through 3 piles of cards refiled with the pool of extra cards.'
                    ]
                },
                { 
                    name: 'Grid', 
                    description: [
                        'Take turns picking a row or column from a grid of 9 cards.',
                        'The grid is reset every 2 picks.'
                    ]
                },
                { 
                    name: 'Pancake', 
                    description: [
                        '9 Rounds of 3 turns',
                        'Pack size - 11 cards',
                        'Turn 1 - Each player takes 1 card then passes the pack to the other player.',
                        'Turn 2 - Each player takes 2 cards then burns 2 and passes back to the other player.',
                        'Turn 3 - Each player takes 2 cards then discards the remaining card.',
                        'Each player will draft 45 cards total.'
                    ]
                },
                { 
                    name: 'BurnFour', 
                    description: [
                        '12 Rounds of 3 turns',
                        'Pack size - 15 cards',
                        'Each turn take 1 card for your deck, remove 4 cards from the pack, then pass the pack to the other player.',
                        'Each player will draft 36 cards total.'
                    ]
                },
                {
                    name: 'Glimpse', 
                    description: [
                        '9 Rounds of 5 turns',
                        'Pack size - 15 cards',
                        'Each turn take 1 card for your deck, remove 2 cards from the pack, then pass the pack to the other player.',
                        'Each player will draft 45 cards total.'
                    ]
                },
                {
                    name: 'Winchester - 88', 
                    description: [
                        'Take turns picking from 1 of 4 available piles.',
                        'After each pick, every pile receives an additional card from the remaining pool of cards.'
                    ]
                }
            ];
    }

}

/**
 * Add this socket's user to the draft as a new or existing drafter.
 * @param {*} playerName 
 * @param {*} draftId 
 */
function joinDraft(playerName, draftId) {
    var draft = this.app.drafts[draftId];
    //Add the player to the list and emit their secret part of the draft
    var socketIndex = isNew(draft, this.socket);
    if (socketIndex >= 0) {
        console.log("Rejoining Draft", playerName, draftId);
        // this.socket.emit('draftUpdate', draft.common.id, draft.secret[socketIndex]); //notify individual player of secret draft update
    } else {
        console.log("Joining Draft", playerName, draftId);
        draft.common.players.push(this.socket.name);
        draft.sockets.push(this.socket);
    }
    this.socket.draftId = draftId;
    this.app.draftBroadcast(draft.common.id); 
    // this.app.broadcast('drafts', this.app.publicDrafts); //publish all public draft updates
}

/**
 * Determine if socket's name is already in the sockets list for the given draft.  If it is,
 * then return the socketIndex of the socket in the socket array.
 * 
 * @param {*} draft 
 * @param {*} socket 
 */
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
    if (!(playerName && cube && draftType)) {
        return;//Error - playerName, cube, and draftType required.
    }
    console.log("CreateDraft", playerName, draftType.name, cube.name);
    let draft = {};
    if (draftType.name === "Grid") {
        draft = createGridDraft(cube);
    } else if (draftType.name === "Winston") {
        draft = createWinstonDraft(cube);
    } else if (draftType.name === "Pancake") {
        draft = createPancakeDraft(cube);
    } else if (draftType.name === "Glimpse") {
        draft = createGlimpseDraft(cube);
    } else if (draftType.name === "BurnFour") {
        draft = createBurnFourDraft(cube);
    } else if (draftType.name === "Winchester") {
        draft = createWinchesterDraft(cube);
    } else {
        draft = createBaseDraft(cube, 90);
        //Error - type not supported
    }
    let draftId = generateUniqueId(this.app);
    draft.common.id = draftId;
    draft.common.players.push(playerName);
    draft.common.type = draftType;
    draft.sockets = [this.socket]; //add socket as player one
    console.log("Draft Created", draftId, playerName, draftType.name, cube.name);
    this.socket.draftId = draftId;
    this.app.drafts[draftId] = draft; //map draft to draft id
    this.app.publicDrafts[draftId] = draft.common; //map draft to draft id
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

/**
 * Create the skeleton of a draft that is common to all draft types.
 * The draft object is designed such that the common property may be shared among
 * all players, the secret property contains information private to the corresponding
 * players, and anything at the base of the draft is hidden from all players. For instance
 * while drafting in Grid, only 1 grid will be public on the common property at a time, but
 * all grids are known to the app directly off the draft object.
 * @param {*} cube 
 * @param {*} poolSize 
 */
function createBaseDraft(cube, poolSize) {
    var draft = {};
    draft.common = createDraftCommon(cube, poolSize);
    draft.secret = [createDraftSecret(0), createDraftSecret(1)];
    return draft;
}

/**
 * Create a draft secret that will store the user's draft specific data that
 * should not be revealed to the other player.  Ex: Deck and sideboard composition.
 * @param {*} index 
 */
function createDraftSecret(index) {
    var secret = {};
    secret.index = index;
    secret.deck = [];
    secret.sideboard = [];
    secret.opponentPool = [];
    return secret;
}

/**
 * Create the base common draft information that will be visible to all players.
 * @param {*} cube 
 * @param {*} poolSize 
 */
function createDraftCommon(cube, poolSize) {
    var shuffledCube = cube.cards.slice(); //make a copy of the cube
    shuffle(shuffledCube); //shuffle it
    var common = {};
    common.poolSize = poolSize;
    //TODO: check if poolSize is larger than cube
    common.pool = shuffledCube.slice(0, poolSize);
    common.playerPools = [ [] , [] ];
    common.players = [];
    common.complete = false;
    common.creationTime = displayTime(new Date());
    common.cube = cube;
    return common;
}

/**
 * Add the grid specific properties to the base draft object.
 * @param {*} cube 
 * @param {*} numGrids 
 * @param {*} colSize 
 */
function createGridDraft(cube, numGrids = 18, colSize = 3) {
    console.log("Creating Grid Draft", numGrids, colSize);
    var gridSize = colSize * colSize; //default is 9
    var poolSize = gridSize * numGrids; //default is 162
    var draft = createBaseDraft(cube, poolSize);
    //The maximum is exclusive and the minimum is inclusive
    draft.common.activePlayer = Math.floor((Math.random() * 2) + 1);
    draft.common.colSize = colSize;
    draft.common.gridSize = gridSize;
    draft.common.numGrids = numGrids;
    draft.grids = createGrids(draft.common.pool, numGrids, colSize);
    console.log("Starting grids", draft.grids);
    draft.common.gridNumber = 1;
    draft.common.turn = 1;
    draft.common.currentGrid = draft.grids[0]; //current grid is the only public grid.
    console.log("Starting grid", draft.common.currentGrid);
    draft.common.rowTaken;
    draft.common.colTaken;
    return draft;
}

/**
 * Create X arrays of length 3 where each index contains another array of length 3.  This
 * array will represent a grid to be drafted.
 * @param {*} pool 
 * @param {*} numGrids 
 * @param {*} colSize 
 */
function createGrids(pool, numGrids, colSize) {
    var grids = []; //grids is an array of grids
    for (var n = 0; n < numGrids; n++) {
        var grid = []; //grid is an array of rows
        for (var i = 0; i < colSize; i++) {
            var row = []; //row is an array of the cards in each column of that row
            for (var j = 0; j < colSize; j++) {
                //Remove a card from the pool and add it to the row.
                row.push(pool.pop());
            }
            //Add a row to the grid
            grid.push(row);
        }
        grids.push(grid);
    }
    return grids;
}

function createWinchesterDraft(cube) {
    //The maximum is exclusive and the minimum is inclusive
    let poolSize = 23 * 4;//Pool size should be a multiple of 4 to ensure that each pile can be replenished.
    draft = createBaseDraft(cube, poolSize);
    draft.common.activePlayer = Math.floor((Math.random() * 2) + 1);
    //The piles are public information in winchester
    draft.common.piles = [];
    draft.pile = draft.common.pool.slice();//copy the pool into a shuffled pile
    shuffle(draft.pile);
    draft.common.piles[0] = draft.pile.pop();
    draft.common.piles[1] = draft.pile.pop();
    draft.common.piles[2] = draft.pile.pop();
    draft.common.piles[3] = draft.pile.pop();
    return draft;
}

function createWinstonDraft(cube) {
    //The maximum is exclusive and the minimum is inclusive
    var poolSize = 15 * 6;//default is 6 packs of 15 cards, 90
    var draft = createBaseDraft(cube, poolSize);
    draft.common.activePlayer = Math.floor((Math.random() * 2) + 1);
    draft.piles = [];
    let thePile = draft.common.pool.slice();
    shuffle(thePile);
    draft.piles[0] = thePile;
    draft.piles[1] = [draft.piles[0].pop()];
    draft.piles[2] = [draft.piles[0].pop()];
    draft.piles[3] = [draft.piles[0].pop()];
    draft.common.pileSizes = [];
    draft.common.pileSizes[0] = draft.piles[0].length;
    draft.common.pileSizes[1] = draft.piles[1].length;
    draft.common.pileSizes[2] = draft.piles[2].length;
    draft.common.pileSizes[3] = draft.piles[3].length;
    draft.resetPileCounts = function() {

    };
    draft.common.activePile = 1;
    //initial the first secret pile for the active player
    draft.secret[draft.common.activePlayer-1].pile = draft.piles[1];
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
    var packSize = 15;
    var picks = [0, 1, 1, 1, 1, 1];
    var burns = [0, 2, 2, 2, 2, 0];
    var turns = 5;
    var draft = createPickBurnDraft(cube, numPacks, packSize, picks, burns, turns);
    return draft;
}

function createPickBurnDraft(cube, numPacks, packSize, picks, burns, turns) {
    var poolSize = numPacks * packSize;
    var draft = createBaseDraft(cube, poolSize);
    var packs = buildPacks(draft.common.pool, packSize, numPacks);
    draft.packs = packs;
    draft.common.turn = 1;
    draft.common.turns = turns;
    draft.common.round = 1;
    draft.common.rounds = numPacks/2;
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
    draft.common.currentPicks = picks[draft.common.turn];//number of picks in the turn
    draft.common.currentBurns = burns[draft.common.turn];//number of burns in the turn
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

export default DraftCreator;
