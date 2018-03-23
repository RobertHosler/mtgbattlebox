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
                
                socket.emit('getAllCards');
                
            }

            return new CardService(socket);
        }
    ]);
