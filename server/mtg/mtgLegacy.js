/* global $*/
var mtg = (function() {

	var isAllCardRetrieved = false;
	var allCards;
	var waitingFunctions = [];

	// var mtgJson = 'http://mtgjson.com/json/AllCards-x.json';
	var mtgJson = '/json/AllCards-x.json';
	// var mtgApi = 'https://api.magicthegathering.io/v1/cards';

	/**
	 * Currently called from draft.js
	 * Append Card images asynchronously
	 */
	var appendCardImages = function(viewId, cardnames) {
		getCardsThen(cardnames, function(cards) {
			addCardsToView(viewId, getCards(cardnames));
		});
	};

	var getCards = function(cardnames) {
		var cards = [];
		//for each cardname in the list of cardnames
		$.each(cardnames, function(index, cardname) {
			//add the card to the list of cards if the cardname matches the index
			if (cardname.includes("//")) {
				//handle split cards
				var cardnameSplit = cardname.split(" // ");
				var cardname1 = cardnameSplit[0];
				var cardname2 = cardnameSplit[1];
				var card1 = allCards[cardname1];
				if (!card1.configured) {
					var card2 = allCards[cardname2];
					card1.card2 = card2;
					var colors = card1.colors.concat(card2.colors);
					var manaCost = card1.manaCost + "/" + card2.manaCost;
					var name = cardname1 + "/" + cardname2;
					var uniqueColors = colors.filter(function(item, pos) {
						return colors.indexOf(item) == pos;
					});
					card1.colors = uniqueColors;
					card1.manaCost = manaCost;
					card1.name = name;
					card1.configured = true;
				}
				cards.push(card1);
			}
			else {
				var card = allCards[cardname];
				cards.push(card);
			}
		});
		return cards;
	};

	var getCardsThen = function(cardnames, postRetrieval) {
		if (allCards) {
			//already retrieved
			postRetrieval();
		}
		else if (isAllCardRetrieved) {
			//retrieved, but not yet initialized
			waitingFunctions.push(postRetrieval);
		}
		else {
			isAllCardRetrieved = true;
			//not yet retrieved
			waitingFunctions.push(postRetrieval);
			$.getJSON(mtgJson, function(obj) {
				allCards = obj;
				$.each(waitingFunctions, function(index, waitingFunction) {
					waitingFunction();
				});
			});
		}
	};

	var addCardsToView = function(viewId, cards) {
		$(viewId).html("");
		$.each(cards, function(index, card) {
			var color = "brown";
			if (card.colors) {
				color = card.colors.length > 1 ? "gold" : card.colors[0].toLowerCase();
			}
			var s = "<div>";
			s += "<div class=\"cardActions\">";
			s += "<button class=\"burnCard draftButton btn btn-default\" onclick=\"draft.burnCard('" + safeString(card.name) + "', this)\" >Burn</button>";
			s += "<button class=\"pickCard draftButton btn btn-default\" onclick=\"draft.pickCard('" + safeString(card.name) + "', this)\" >Pick</button></div>";
			//Border
			s += "<div class=\"writtenCard " + color + "\"><div class=\"innerWrittenCard\">";
			//Card name and manacost
			s += "<div class=\"cardNameRow\">";
			if (card.manaCost) { s += "<span class=\"manaCost\">" + prettySymbolText(card.manaCost) + "</span>"; }
			s += "<span class=\"cardName\">" + card.name + "</span>";
			s += "</div>";
			//Type
			s += "<div class=\"cardType\">" + card.type + "</div>";
			//Card Text
			s += "<div class=\"cardText\">" + prettySymbolText(card.text) + "</div>";
			//Power/Toughness - Loyalty
			s += "<div class=\"cardNumber\" style=\"text-align: right;\">";
			if (card.power || card.loyalty) {
				s += "<span class=\"powerToughness\">";
				if (card.power) {
					s += card.power + "/" + card.toughness;
				}
				else if (card.loyalty) {
					s += card.loyalty;
				}
				s += "</span>";
			}
			s += "</div></div></div>";//end border divs
			s += "</div>";
			$(viewId).append(s);
		});
	};

	/**
	 * Returns card names in multiple color sorted arrays sorted by cmc.
	 */
	var appendSortedCardNames = function(divId, cardnames) {
		getCardsThen(cardnames, function() {
			var cards = getCards(cardnames);
			var creatureCount = 0;
			var nonLandCount = 0;
			var cmcList = [];
			var result = {
				white: [],
				blue: [],
				black: [],
				red: [],
				green: [],
				multi: [],
				land: [],
				colorless: []
			};
			$.each(cards, function(index, card) {
				if (!card) { return; }
				var cmc = card.cmc;
				cmcList[cmc] = cmcList[cmc] ? cmcList[cmc] + 1 : 1;
				var colors = card.colors ? card.colors.length : 0;
				if ($.inArray("Creature", card.types) > -1) {
					creatureCount++;
				}
				if ($.inArray("Land", card.types) < 0) {
					nonLandCount++;
				}
				switch (colors) {
					case 0: //Colorless or land
						switch (card.types[0]) {
							case "Land":
								result.land.push(card);
								break;
							default:
								result.colorless.push(card);
						}
						break;
					case 1: //Single Color
						switch (card.colors[0]) {
							case "White":
								result.white.push(card);
								break;
							case "Blue":
								result.blue.push(card);
								break;
							case "Black":
								result.black.push(card);
								break;
							case "Red":
								result.red.push(card);
								break;
							case "Green":
								result.green.push(card);
								break;
						}
						break;
					default: //Multicolor
						result.multi.push(card);
				}
			});
			var cmcOutput = "<div class=\"curve\"><div><strong>Curve</strong></div>";
			$.each(cmcList, function(cmc, count) {
				cmcOutput += "<div>" + prettySymbolText("{" + cmc + "}") + ": " + (count ? count : 0) + "</div>";
			});
			cmcOutput += "<div>Creatures: " + creatureCount + "</div>";
			cmcOutput += "<div>NonLands: " + nonLandCount + "</div>";
			cmcOutput += "<div>Total: " + cards.length + "</div>";
			cmcOutput += "</div>";
			result.white.sort(compareCmc);
			result.blue.sort(compareCmc);
			result.black.sort(compareCmc);
			result.red.sort(compareCmc);
			result.green.sort(compareCmc);
			result.multi.sort(compareCmc);
			result.colorless.sort(compareCmc);
			var sortedCards = result;
			var colorList = "";
			$.each(sortedCards, function(index, array) {
				if (array.length === 0) {
					return;
				}
				colorList += "<div class=\"colorBlock\">";
				colorList += "<div class=\"colorList\">" + index + " - " + array.length + "</div><div>";
				$.each(array, function(index, item) {
					colorList += "<div class=\"row\">";
					if (item.types[0] == "Land") {
						var colors = "";
						$.each(item.colorIdentity, function(i, color) { colors += "{"+color+"}"; });
						if (item.text.indexOf("Plains") >= 0) { 	colors += "{W}"; }
						if (item.text.indexOf("Island") >= 0) { 	colors += "{U}"; }
						if (item.text.indexOf("Swamp") >= 0) { 	colors += "{B}"; }
						if (item.text.indexOf("Mountain") >= 0) { 	colors += "{R}"; }
						if (item.text.indexOf("Forest") >= 0) { 	colors += "{G}"; }
						colorList += "<div class=\"col-xs-4 mana\">" + prettySymbolText(colors) + "</div>";
					} else {
						colorList += "<div class=\"col-xs-4 mana\">" + prettySymbolText(item.manaCost) + "</div>";
					}
					//Make name of card clickable to provide options for moving to sideboard
					colorList += "<div class=\"col-xs-8\">" + item.name;
					colorList += " <a class=\"btn-sideboard\" href=\"javascript:void(0)\" onclick=\"draft.moveToSideboard('" + safeString(item.name) + "', this)\" >SB</a>";
					colorList += " <a class=\"btn-maindeck\" href=\"javascript:void(0)\" onclick=\"draft.moveToDeck('" + safeString(item.name) + "', this)\" >MB</a>";
					colorList += "</div></div>";
				});
				colorList += "</div></div>";
			});
			$(divId).html("");
			$(divId).append(colorList);
			$(divId).append(cmcOutput);
		});
	};

	var safeString = function(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, "\\'").replace(/\//g, " // ");
	};

	var compareCmc = function(cardA, cardB) {
		var result;
		var isCardCreatureA = cardA.types.includes("Creature");
		var isCardCreatureB = cardB.types.includes("Creature");
		if (isCardCreatureA && !isCardCreatureB) {
			result = 1;
		}
		else if (!isCardCreatureA && isCardCreatureB) {
			result = -1;
		}
		else {
			var cmcA = cardA.manaCost && cardA.manaCost.includes("X") ? 100 : cardA.cmc;
			var cmcB = cardB.manaCost && cardB.manaCost.includes("X") ? 100 : cardB.cmc;
			result = cmcA - cmcB;
		}
		return result;
	};

	/**
	 *  Converts mana, tap, and numbers to pretty graphics
	 */
	var prettySymbolText = function(textWithSymbols) {
		if (!textWithSymbols) return "";
		var symbols = ["{T}", "{Q}", "{[0]}", "{[1]}", "{[2]}", "{[3]}", "{[4]}", "{[5]}", "{[6]}", "{[7]}", "{[8]}", "{[9]}", "{X}", "{W}", "{U}", "{B}", "{R}", "{G}", "{C}", "{W/B}", "{R/W}", "{W/U}", "{G/W}", "{U/B}", "{U/R}", "{G/U}", "{R/G}", "{B/G}", "{B/R}", "{2/W}", "{2/U}", "{2/B}", "{2/R}", "{2/G}", "{W/P}", "{U/P}", "{B/P}", "{R/P}", "{G/P}"];
		symbols.forEach(function(element) {
			var regex = new RegExp(element, "g");
			textWithSymbols = textWithSymbols.replace(regex, manaSymbol(element));
		});
		// var keyboards = ["Flying", "Battle cry", "Soulbond", "First strike", "Trample", "Hexproof", "Shroud", "Haste"];
		// keyboards.forEach(function(element) {
		// 	var regex = new RegExp(element, "g");
		// 	textWithSymbols = textWithSymbols.replace(regex, "<strong>"+element+"</strong>");
		// });
		textWithSymbols = textWithSymbols.replace(/(?:\r\n|\r|\n)/g, '<div></div>');
		textWithSymbols = textWithSymbols.replace(/\{|\}/g, ''); //remove braces
		return textWithSymbols;
	};

	var manaSymbol = function(symbol) {
		symbol = symbol.replace(/\/|\[|\]|\{|\}/g, ''); //remove braces
		var result = "";
		var imgSrc = "../images/mana/" + symbol + ".svg";
		result = "<img class=\"manaSymbol\" src=\"" + imgSrc + "\">";
		return result;
	};

	var appendCardNames = function(divId, cardnames) {
		$.each(cardnames, function(index, cardname) {
			$(divId).append("<div>" + cardname + "</div>");
		});
	};

	var cardCountString = function(size) {
		if (size == 1) {
			return size + " Card";
		}
		else {
			return size + " Cards";
		}
	};

	return {
		appendCardNames: appendCardNames,
		appendSortedCardNames: appendSortedCardNames,
		appendCardImages: appendCardImages,
		prettySymbolText: prettySymbolText,
		cardCountString: cardCountString
	};
})();
