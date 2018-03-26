/* global angular */
angular.module('mtg')
    .factory('CardService', ['socket',
        function(socket) {
            
            function CardService(socket) {
                var self = this;
                self.cards = {};
                self.observers = [];
                
                socket.on('cardsUpdate', function(card) {
                    self.cards[card.name] = card;
                    notifyObservers();
                });
                
                socket.on('allCards', function(allCards) {
                    self.cards = allCards;
                    notifyObservers();
                });
    
                self.register = function(observer) {
                    self.observers.push(observer);
                };
                
                self.disconnect = function(observer) {
                    self.observers.splice(self.observers.indexOf(observer), 1);
                };
                
                function notifyObservers() {
                    self.observers.forEach(function(observer) {
                        observer();
                    });
                }
                
                self.getCard = function(cardName) {
                    var card = self.cards[cardName];
                    if (!card) {
                        self.cards[cardName] = {};//placeholder object
                        socket.emit('getFullCard', cardName);
                    }
                };
                
                self.getCards = function(cardList) {
                    cardList.forEach(function(cardName) {
                        self.getCard(cardName);
                    });
                };
                
                self.getCardImage = function(cardName, placeholder) {
                    var card = self.cards[cardName];
                    if (card && card.image_uris) {
                        return card.image_uris['normal'];
                    } else if (card && card.card_faces && !placeholder) {
                        return card.card_faces[0].image_uris['normal'];
                    } else {
                        return placeholder ? placeholder : "https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Magic_the_gathering-card_back.jpg/200px-Magic_the_gathering-card_back.jpg";
                    }
                }
                
                socket.emit('getAllCards');
                
            }

            return new CardService(socket);
        }
    ]);
