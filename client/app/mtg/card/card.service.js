/* global angular */
angular.module('mtg')
    .factory('CardService', ['socket',
        function(socket) {
            
            function CardService(socket) {
                var self = this;
                self.cards = {};
                self.observers = [];
                self.cardsLoaded = [];
                self.cardBack = "https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Magic_the_gathering-card_back.jpg/200px-Magic_the_gathering-card_back.jpg";
                
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
                    if (!card || !card.id) {
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
                        return self.loadCardImage(card);
                    } else if (card && card.card_faces && !placeholder) {
                        return self.loadCardFace(card);
                    } else {
                        return placeholder ? placeholder : self.cardBack;
                    }
                }
                
                self.loadCardImage = function(card) {
                    var source = card.image_uris['normal'];
                    return self.loadCardSrc(card, source);
                }
                
                self.loadCardFace = function(card) {
                    var source = card.card_faces[0].image_uris['normal'];
                    return self.loadCardSrc(card, source);
                }
                
                self.loadCardSrc = function(card, source) {
                    var downloadingImage = new Image();
                    var cached = false;
                    if (!self.cardsLoaded[card.name]) {
                        self.cardsLoaded[card.name] = card.name;
                        downloadingImage.onload = function() {
                            notifyObservers();
                        };
                    }
                    downloadingImage.src = source;
                    cached = downloadingImage.complete;
                    var imageSrc = downloadingImage.src;
                    if (cached) {
                        // downloadingImage.onload = function() {};
                        //cached in browser
                        // return downloadingImage.src;
                    } else {
                        //return placeholder image and load asynchronously
                        imageSrc = self.cardBack;
                    }
                    return imageSrc;
                }
                
                socket.emit('getAllCards');
                
            }

            return new CardService(socket);
        }
    ]);
