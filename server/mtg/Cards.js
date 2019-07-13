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

const Scry = require("scryfall-sdk");
let cardsRetrieved = {};
const moment = require('moment');
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
}

/**
 * Load a single card
 */
function getFullCard(cardName) {
    var app = this.app;
    var socket = this.socket;
    log (socket, "Loading card " + cardName);
    
    let cardList = [cardName];
    pullCardList(cardList, app, socket, function() {
        socket.emit('cardsUpdate', app.allCards[cardName]);
    });
    log (socket, "End Loading card " + cardName);
}

/**
 * Create a query for the scryfall api looking for the exact card names.
 * 
 * Query should look like [!"Doom Blade" or !"Explore" or]
 * 
 */
function pullCardList(cardList, app, socket, doneFunction) {
    let query = "";
    cardList.forEach(function(cardName) {
        let fullCard = app.allCards[cardName];//only query cards that need loaded
        if (!fullCard) {
            query += ("!\"" + cardName + "\" or ");
        }
    });
    log(socket, ("Query: [" + query + "]"));
    try {
        Scry.Cards.search(query).on("data", (card) => {
            console.log("Loaded " + card.name);
            let cardIndex = card.name;
            if (card.name.indexOf("//") > 0 && card.layout === "transform") {
                //Transform cards are indexed by the front card name only
                cardIndex = card.name.substring(0, card.name.indexOf(" // "));
            }
            app.allCards[cardIndex] = card; //save the card to allCards
        }).on("end", () => {
            log(socket, "done");
            doneFunction();
        });
    } catch (e) {
        log(socket, e);
    }
}

/**
 * Deprecated, just call cardlist with one card
 */
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
