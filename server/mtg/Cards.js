var Cards = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        getFullCard: getFullCard.bind(this),
        getFullCards: getFullCards.bind(this),
        getAllCards: getAllCards.bind(this)
    };
};

var Scry = require("scryfall-sdk");
var cardsRetrieved = {};
var moment = require('moment');
const time = () => moment().format('hh:mm:ss:SSS');
const log = (socket, msg) => console.log(socket.name, msg, "@ " + time());

/**
 * A socket may request the current database of all loaded cards.
 */
function getAllCards() {
    this.socket.emit('allCards', this.app.allCards);
    // this.app.broadcast('drafts', this.app.publicDrafts);
}

/**
 * Load a list of cards and emit an update to the full card list once complete.
 */
function getFullCards(cardList) {
    var app = this.app;
    var socket = this.socket;
    log (socket, "Loading cardList " + cardList);
    //Load each card
    pullCardList(cardList, app, socket, function() {
        socket.emit('allCards', app.allCards);
    });
    // cardList.forEach(function(cardName) {
    //     setTimeout(function() {
    //         pullFullCard(cardName, app, socket);
    //     }, 200);
    // });
    //Wait for each to be loaded
    // waitForCards(cardList, app, socket, function() {
    //     socket.emit('allCards', app.allCards);
    // });
}

/**
 * Load a single card
 */
function getFullCard(cardName) {
    var app = this.app;
    var socket = this.socket;
    log (socket, "Loading card " + cardName);
    var fullCard = pullFullCard(cardName, app, socket);
    if (!fullCard) {
        //card needs to be retrieved, wait for card
        // log (socket, "Couldn't pull full card " + cardName);
        // return;//couldn't pull full card
        fullCard = waitForCard(cardName, app, socket);
        this.socket.emit('cardsUpdate', fullCard);
    } else {
        this.socket.emit('cardsUpdate', fullCard);
    }
    log (socket, "End Loading card " + cardName);
}

function pullCardList(cardList, app, socket, doneFunction) {
    let query = "";
    cardList.forEach(function(cardName) {
        query += ("!\"" + cardName + "\" or ");
    });
    console.log("Query", query);
    Scry.Cards.search(query).on("data", card => {
        console.log("Loaded " + card.name); 
        if (card.name.indexOf("//") > 0 && card.layout === "transform") {
            let cardNameSplit = card.name.substring(0, card.name.indexOf(" // "));
            app.allCards[cardNameSplit] = card; //save the card to allCards
        } else {
            app.allCards[card.name] = card; //save the card to allCards
        }
    }).on("end", () => {
        console.log("done");
        doneFunction();
    });
}

function pullFullCard(cardName, app, socket) {
    if (!cardName) {
        return;
    }
    var fullCard = app.allCards[cardName];
    if (!fullCard) {
        if (!cardsRetrieved[cardName]) {
            let startTime = moment();
            console.log(socket.name, "Retrieving " + cardName);
            console.log(time());
            cardsRetrieved[cardName] = cardName;
            //Perform asynchronous request to download card info
            Scry.Cards.byName(cardName).then(result => {
                if (result) {
                    fullCard = result;
                    let endTime = moment();
                    let totalTime = endTime - startTime;
                    log(socket, "Retrieved " + result.name + " in " + totalTime);
                    // console.log(result);
                    // console.log("Full card retrieved", fullCard);
                    app.allCards[cardName] = fullCard; //save the card to allCards
                } else {
                    log (socket, cardName + " Not Found");
                    fullCard = 'not found';
                }
            }, reason => {
              log(socket, "Error retrieving card", cardName, reason); // Error!
            } );
        }
        // else {
        //     //full card isn't available, but has already been requested by another socket keep checking for it and then return
        //     log(socket, cardName + " already requested, wait for single card started");
        //     fullCard = waitForCard(cardName, app, socket);
        // }
    }
    return fullCard;
}

//Keep checking every half-second to see if the card is now populated in the all cards list
function waitForCard(cardName, app, socket) {
    // console.log(socket.name, "waiting for card", cardName, moment().format('HH:mm:ss:SSS Z'));
    // console.log(socket.name, "waiting for ")
    log(socket, "Wait for card " + cardName);
    setTimeout(function() {
        var fullCard = app.allCards[cardName];
        if (!fullCard) {
            waitForCard(cardName, app, socket);
        } else {
            return fullCard;
        }
    }, 1000);
}

function waitForCards(cardList, app, socket, doneFunction) {
    var done = true;
    //Check if all cards are loaded
    cardList.forEach(function(cardName) {
        if (cardName) {
            var fullCard = app.allCards[cardName];
            if (!fullCard) {
                done = false;
            }
        }
    });
    if (done) {
        log(socket, "Retrieved all cards");
        doneFunction();
    } else {
        //Wait and then check again to see if all cards are loaded
        log(socket, "Waiting for cards");
        setTimeout(function() {
            waitForCards(cardList, app, socket, doneFunction);
        }, 1000);
    }
}

module.exports = Cards;
