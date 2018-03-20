var DraftCreator = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        createDraft: createDraft.bind(this)
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

function createDraft(playerName, draftType, cube) {
    console.log("CreateDraft", playerName, draftType.name, cube.name);
    //TODO: prevent players from creating multiple drafts
    //generate unique draft id
    var draftId;
    while (true) {
        draftId = (Math.random() + 1).toString(36).slice(2, 18); //TODO: prevent same id from appearing
        if (this.app.drafts[draftId]) {
            continue; //id not unique, keep generating
        }
        else {
            break; //id is unique
        }
    }
    var draft = {};
    if (draftType === "Grid") {
        draft = createGridDraft(cube);
    }
    else {
        draft = createBaseDraft(cube, 90);
        //Error - type not supported
    }
    draft.public.id = draftId;
    draft.public.players.push(String(playerName || 'Anonymous'));
    draft.public.type = draftType;
    draft.sockets = ['', this.socket]; //add socket as player one
    console.log("Draft Created", draftId);
    this.app.drafts[draftId] = draft; //map draft to draft id
    this.app.publicDrafts[draftId] = draft.public; //map draft to draft id
    this.socket.emit('draftUpdate', draft.public.id, draft.secret[1]); //notify individual player of secret draft update
    this.app.broadcast('drafts', this.app.publicDrafts); //publish all public draft updates
}

function createBaseDraft(cube, poolSize) {
    var draft = {};
    draft.public = createDraftPublic(cube, poolSize);
    draft.secret = [{}, createDraftSecret(), createDraftSecret()];
    return draft;
}

function createDraftSecret() {
    var secret = {};
    secret.deck = [];
    secret.sideboard = [];
    secret.pool = [];
    return secret;
}

function createDraftPublic(cube, poolSize) {
    var shuffledCube = cube.cards.slice(); //make a copy of the cube
    MtgUtil.shuffle(shuffledCube); //shuffle it
    var public = {};
    public.poolSize = poolSize;
    //The maximum is exclusive and the minimum is inclusive
    public.activePlayer = Math.floor((Math.random() * 2) + 1);
    //TODO: check if poolSize is larger than cube
    public.pool = shuffledCube.slice(0, poolSize);
    public.playerPools = ['', [],
        []
    ];
    public.players = [''];
    public.turn = 1;
    public.complete = false;
    public.creationTime = displayTime(new Date());
    public.cube = cube;
    return public;
}

function createGridDraft(cube, numGrids = 18, colSize = 3) {
    var gridSize = colSize * colSize; //default is 9
    var poolSize = gridSize * numGrids //default is 162
    var draft = createBaseDraft(cube, poolSize);
    draft.public.colSize = colSize;
    draft.public.gridSize = gridSize;
    draft.public.numGrids = numGrids;
    draft.secret[0].grids = createGrids(draft.pool, draft.numGrids, draft.colSize);
    draft.public.gridNumber = 1;
    draft.public.currentGrid = draft.secret[0].grids[draft.public.gridNumber]; //current grid is the only public grid.
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
