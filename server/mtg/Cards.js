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

function getAllCards() {
    this.socket.emit('allCards', this.app.allCards);
    // this.app.broadcast('drafts', this.app.publicDrafts);
}

/**
 * Load a list of cards and emit an update to the full card list once complete.
 */
function getFullCards(cardList) {
    console.log("Loading cardList", cardList);
    var app = this.app;
    //Load each card
    cardList.forEach(function(cardName) {
        pullFullCard(cardName, app);
    });
    //Wait for each to be loaded
    var socket = this.socket;
    waitForCards(cardList, app, function() {
        socket.emit('allCards', app.allCards);
    });
}

/**
 * Load a single card
 */
function getFullCard(cardName) {
    var fullCard = pullFullCard(cardName, this.app);
    if (!fullCard) {
        console.log("couldn't pull full card", cardName);
        return;//couldn't pull full card
    } else {
        this.socket.emit('cardsUpdate', fullCard);
    }
}

function pullFullCard(cardName, app) {
    if (!cardName) {
        return;
    }
    var fullCard = app.allCards[cardName];
    if (!fullCard) {
        if (!cardsRetrieved[cardName]) {
            cardsRetrieved[cardName] = cardName;
            var requestTime = moment();
            var formattedRequestTime = requestTime.format('YYYY-MM-DD HH:mm:ss Z');
            console.log("Retrieving", cardName, formattedRequestTime);
            Scry.Cards.byName(cardName).then(result => {
                if (result) {
                    fullCard = result;
                    var requestTime = moment();
                    var formattedResultTime = requestTime.format('YYYY-MM-DD HH:mm:ss Z');
                    console.log("Retrieved", result.name, formattedResultTime);
                    // console.log(result);
                    // console.log("Full card retrieved", fullCard);
                    app.allCards[cardName] = fullCard; //save the card to allCards
                } else {
                    fullCard = 'not found';
                }
            }, reason => {
              console.log(reason); // Error!
            } );
        } else {
            //full card isn't available, but has already been requested by another socket keep checking for it and then return
            fullCard = waitForCard(cardName, app);
        }
    }
    return fullCard;
}

//Keep checking every half-second to see if the card is now populated in the all cards list
function waitForCard(cardName, app) {
    console.log("waiting for card", cardName);
    setTimeout(function() {
        var fullCard = app.allCards[cardName];
        if (!fullCard) {
            waitForCard(cardName, app);
        } else {
            return fullCard;
        }
    }, 500);
}

function waitForCards(cardList, app, doneFunction) {
    var done = true;
    cardList.forEach(function(cardName) {
        if (cardName) {
            var fullCard = app.allCards[cardName];
            if (!fullCard) {
                done = false;
            }
        }
    });
    if (done) {
        doneFunction();
    } else {
        console.log("waiting for cards", cardList);
        setTimeout(function() {
            waitForCards(cardList, app, doneFunction);
        }, 500);
    }
}

module.exports = Cards;
