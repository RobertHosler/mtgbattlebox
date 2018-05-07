var Cards = function(app, socket) {
    this.app = app;
    this.socket = socket;

    // Expose handler methods for events
    this.handler = {
        // use the bind function to access this.app and this.socket in events
        getFullCard: getFullCard.bind(this),
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

function getFullCard(cardName) {
    if (!cardName) {
        return;
    }
    var fullCard = this.app.allCards[cardName];
    if (!fullCard) {
        if (!cardsRetrieved[cardName]) {
            cardsRetrieved[cardName] = cardName;
            var requestTime = moment();
            var formattedRequestTime = requestTime.format('YYYY-MM-DD HH:mm:ss Z');
            console.log("Retrieving", cardName, formattedRequestTime);
            Scry.Cards.byName(cardName).then(result => {
                fullCard = result;
                var requestTime = moment();
                var formattedResultTime = requestTime.format('YYYY-MM-DD HH:mm:ss Z');
                console.log("Retrieved", result.name, formattedResultTime);
                // console.log(result);
                // console.log("Full card retrieved", fullCard);
                this.app.allCards[cardName] = fullCard; //save the card to allCards
                this.socket.emit('cardsUpdate', fullCard);
            }, reason => {
              console.log(reason); // Error!
            } );
        } else {
            //full card isn't available, but has already been requested by another socket keep checking for it and then return
            waitForCard(cardName, this.socket, this.app);
        }
    } else {
        this.socket.emit('cardsUpdate', fullCard);
    }
}

//Keep checking every second to see if the card is now populated
function waitForCard(cardName, socket, app) {
    setTimeout(function() {
        var fullCard = app.allCards[cardName];
        if (!fullCard) {
            waitForCard(cardName, socket, app);
        } else {
            socket.emit('cardsUpdate', fullCard);
        }
    }, 500);
}

module.exports = Cards;
