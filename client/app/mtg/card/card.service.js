/* global angular */
angular.module('mtg')
    .factory('CardService', ['socket',
        function(socket) {
            
            function CardService(socket) {
                var self = this;
                self.cards = {};
                self.observers = [];
                self.cardImagesLoaded = [];
                self.cardsRequested = [];
                self.cardBack = "https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Magic_the_gathering-card_back.jpg/200px-Magic_the_gathering-card_back.jpg";
                
                socket.on('cardsUpdate', function(card) {
                    console.log("Card Update", card.name);
                    self.cards[card.name] = card;
                    notifyObservers();
                });
                
                socket.on('allCards', function(allCards) {
                    console.log("All Cards Update");
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
                    var cardRequested = self.cardsRequested[cardName];
                    if (!cardRequested && (!card || !card.id)) {
                        self.cardsRequested.push(cardName);
                        self.cards[cardName] = {};//placeholder object
                        socket.emit('getFullCard', cardName);
                    }
                };
                
                self.getCards = function(cardList) {
                    var cardsToRequest = [];
                    cardList.forEach(function(cardName) {
                        var card = self.cards[cardName];
                        var cardRequested = self.cardsRequested[cardName];
                        if (!cardRequested && (!card || !card.id)) {
                            self.cardsRequested.push(cardName);
                            cardsToRequest.push(cardName);
                        }
                    });
                    if (cardsToRequest.length > 0) {
                        socket.emit('getFullCards', cardsToRequest);
                    }
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
                
                self.getCardBack = function() {
                    return self.cardBack;
                }
                
                self.loadCardImage = function(card) {
                    var source = card.image_uris['normal'];
                    return source;
                    // return self.loadCardSrc(id, card, source);
                }
                
                self.loadCardFace = function(card) {
                    var source = card.card_faces[0].image_uris['normal'];
                    return source;
                    // return self.loadCardSrc(id, card, source);
                }
                
                self.loadCardSrc = function(card, source) {
                    var downloadingImage = new Image();
                    var cached = false;
                    if (!self.cardImagesLoaded[card.name]) {
                        self.cardImagesLoaded[card.name] = card.name;
                        downloadingImage.onload = function() {
                            // notifyObservers();
                            downloadingImage.src = source;
                        };
                    }
                    downloadingImage.src = source;
                    cached = downloadingImage.complete;
                    var imageSrc = downloadingImage.src;
                    if (!cached) {
                        //return placeholder image and load asynchronously
                        imageSrc = self.cardBack;
                    } else {
                        // downloadingImage.onload = function() {};
                        //cached in browser
                        // return downloadingImage.src;
                    }
                    return imageSrc;
                }
                
                self.getCardMana = function(cardName) {
                    var card = self.cards[cardName];
                    if (card.card_faces) {
                        card = card.card_faces[0];
                    }
                    if (card && card.mana_cost) {
                        return self.symbolImageList(card.mana_cost);
                    } else if (card && card.type_line.includes("Land")) {
                        return self.getLandMana(card);
                    } else {
                        return [];
                    }
                }
                
                self.symbolImageList = function(manaCost) {
                    var list = [];
            		var splitCost = manaCost.split('}');
            		splitCost.forEach(function(element) {
            		    if (element) {
            		        list.push(self.manaSymbolImgSrc(element));
            		    }
            		});
            		return list;
                }
                
                self.prettySymbolText = function(textWithSymbols) {
            		if (!textWithSymbols) return "";
            		var symbols = ["{T}", "{Q}", "{[0]}", "{[1]}", "{[2]}", "{[3]}", "{[4]}", "{[5]}", "{[6]}", "{[7]}", "{[8]}", "{[9]}", "{X}", "{W}", "{U}", "{B}", "{R}", "{G}", "{C}", "{W/B}", "{R/W}", "{W/U}", "{G/W}", "{U/B}", "{U/R}", "{G/U}", "{R/G}", "{B/G}", "{B/R}", "{2/W}", "{2/U}", "{2/B}", "{2/R}", "{2/G}", "{W/P}", "{U/P}", "{B/P}", "{R/P}", "{G/P}"];
            		symbols.forEach(function(element) {
            			var regex = new RegExp(element, "g");
            			textWithSymbols = textWithSymbols.replace(regex, self.manaSymbol(element));
            		});
            		textWithSymbols = textWithSymbols.replace(/(?:\r\n|\r|\n)/g, '<div></div>');
            		textWithSymbols = textWithSymbols.replace(/\{|\}/g, ''); //remove braces
            		return textWithSymbols;
                }
                
                self.manaSymbol = function(symbol) {
            		symbol = symbol.replace(/\/|\[|\]|\{|\}/g, ''); //remove braces
            		var result = "";
            		var imgSrc = "../img/mtg/symbols/" + symbol + ".svg";
            		result = "<img class=\"manaSymbol\" src=\"" + imgSrc + "\">";
            		return result;
            	}
                
                self.manaSymbolImgSrc = function(symbol) {
            		symbol = symbol.replace(/\/|\[|\]|\{|\}/g, ''); //remove braces
            		var imgSrc = "../img/mtg/symbols/" + symbol + ".svg";
            		return imgSrc;
            	}
            	
            	self.getLandMana = function(card) {
            	    var colors = "";
            	    card.color_identity.forEach(function(color) {
            	       colors += color + "}"; 
            	    });
					if (card.oracle_text.indexOf("Plains") >= 0) { colors += "{W}"; }
					if (card.oracle_text.indexOf("Island") >= 0) { colors += "{U}"; }
					if (card.oracle_text.indexOf("Swamp") >= 0) { colors += "{B}"; }
					if (card.oracle_text.indexOf("Mountain") >= 0) { colors += "{R}"; }
					if (card.oracle_text.indexOf("Forest") >= 0) { colors += "{G}"; }
					return self.symbolImageList(colors);
            	}
            	
            	self.sortCardList = function(cardList) {
            	    if (!cardList) return {};
            	    var result = {
        				white: [],
        				blue: [],
        				black: [],
        				red: [],
        				green: [],
        				multi: [],
        				land: [],
        				colorless: [],
        				curve: [],
        				mostOnCurve: 0,
        				noncreatureCount: 0
        			};
            	    cardList.forEach(function(cardName) {
                        var card = self.cards[cardName];
                        if (!card) {
                            console.log("No card found:", cardName);
                            return;
                        } else if (card.card_faces) {
                            card = card.card_faces[0];
                        }
                        if (!card.colors || card.colors.length === 0) {
            	            //colorless or land
            	            if (card.type_line && card.type_line.includes("Land")) {
        	                    result.land.push(card);
            	            } else {
        	                    result.colorless.push(card);
				                result.curve[card.cmc] = result.curve[card.cmc] ? result.curve[card.cmc] + 1 : 1;
            	            }
                        } else if (card.colors.length > 1) {
            	            //multicolor
    	                    result.multi.push(card);
			                result.curve[card.cmc] = result.curve[card.cmc] ? result.curve[card.cmc] + 1 : 1;
            	        } else {
            	            //determine color
            	            switch(card.colors[0]) {
            	                case "W":
            	                    result.white.push(card);
            	                    break;
            	                case "U":
            	                    result.blue.push(card);
            	                    break;
            	                case "B":
            	                    result.black.push(card);
            	                    break;
            	                case "R":
            	                    result.red.push(card);
            	                    break;
            	                case "G":
            	                    result.green.push(card);
            	                    break;
            	            }
			                result.curve[card.cmc] = result.curve[card.cmc] ? result.curve[card.cmc] + 1 : 1;
            	        }
            	        if (card.type_line && !card.type_line.includes("Creature") && !card.type_line.includes("Land")) {
            	            result.noncreatureCount++;
            	        }
            	    });
            	    result.curve.forEach(function(element) {
            	        if (element > result.mostOnCurve) {
            	            result.mostOnCurve = element;
            	        }
            	    });
        			result.white.sort(self.compareCmc);
        			result.blue.sort(self.compareCmc);
        			result.black.sort(self.compareCmc);
        			result.red.sort(self.compareCmc);
        			result.green.sort(self.compareCmc);
        			result.multi.sort(self.compareCmc);
        			result.colorless.sort(self.compareCmc);
        			self.cardNamesOnly(result.white);
        			self.cardNamesOnly(result.blue);
        			self.cardNamesOnly(result.black);
        			self.cardNamesOnly(result.red);
        			self.cardNamesOnly(result.green);
        			self.cardNamesOnly(result.multi);
        			self.cardNamesOnly(result.colorless);
        			self.cardNamesOnly(result.land);
        			return result;
            	}
            	
            	self.cardNamesOnly = function(cardList) {
            	    for (var i = 0; i < cardList.length; i++) {
            	        cardList[i] = cardList[i].name;
            	    }
            	    return cardList;
            	}
            	
            	self.compareCmc = function(cardA, cardB) {
            		var result;
            		var isCardCreatureA = cardA.type_line.includes("Creature");
            		var isCardCreatureB = cardB.type_line.includes("Creature");
            		if (isCardCreatureA && !isCardCreatureB) {
            			result = 1;
            		}
            		else if (!isCardCreatureA && isCardCreatureB) {
            			result = -1;
            		}
            		else {
            			var cmcA = cardA.mana_cost && cardA.mana_cost.includes("X") ? 100 : cardA.cmc;
            			var cmcB = cardB.mana_cost && cardB.mana_cost.includes("X") ? 100 : cardB.cmc;
            			result = cmcA - cmcB;
            		}
            		return result;
            	};
                
                socket.emit('getAllCards');
                
            }

            return new CardService(socket);
        }
    ]);
