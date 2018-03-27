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

function getAllCards() {
    this.socket.emit('allCards', this.app.allCards);
    // this.app.broadcast('drafts', this.app.publicDrafts);
}

function getFullCard(cardName, callback) {
    if (!cardName) {
        return;
    }
    var fullCard = this.app.allCards[cardName];
    if (!fullCard) {
        if (!cardsRetrieved[cardName]) {
            cardsRetrieved[cardName] = cardName;
            Scry.Cards.byName(cardName).then(result => {
                fullCard = result;
                console.log("Retrieved", result.name);
                // console.log(result);
                // console.log("Full card retrieved", fullCard);
                this.app.allCards[cardName] = fullCard; //save the card to allCards
                this.socket.emit('cardsUpdate', fullCard);
            }, reason => {
              console.log(reason); // Error!
            } );
        }
    } else {
        this.socket.emit('cardsUpdate', fullCard);
    }
}

module.exports = Cards;
