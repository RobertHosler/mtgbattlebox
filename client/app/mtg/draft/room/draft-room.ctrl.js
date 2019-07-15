/*global angular*/
/*global $*/
angular
    .module('draft')
    .controller('DraftCtrl',
        ['$scope', 'UserService', 'DraftService', 'socket', 'CardService', '$location', '$window',
        function($scope, UserService, DraftService, socket, CardService, $location, $window) {
            
            $scope.draftService = DraftService;
            $scope.cardService = CardService;
            $scope.draftInclude = '';//once a new draft is detected, this will be set
            $scope.stacked = true;
            $scope.cmc = false;//sort by color by default
            
            function draftServiceUpdate() {
                init();
                $scope.$apply();
            }
            
            function cardServiceUpdate() {
                init();
                $scope.$apply();
            }
            
            DraftService.register(draftServiceUpdate);
            CardService.register(cardServiceUpdate);
            
			// Unregister
			$scope.$on('$destroy', function () {
				DraftService.disconnect(draftServiceUpdate);
				CardService.disconnect(cardServiceUpdate);
			});
            
    		const dt = new Date();
    		const date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
	        let fileName;
            
            /**
             * Function to be run on page load and whenever there is a service update
             * to make sure that scope variables are properly set
             */
            function init() {
                initDraft();
            }
            
            function initDraft() {
                fileName = "/decks/" + date + "_" + DraftService.draftId + "_" + UserService.name + ".txt";
                $scope.cubes = DraftService.cubes;
                let newDraft = DraftService.draftId !== $scope.draftId;
                $scope.draftId = DraftService.draftId;
                $scope.publicDraft = DraftService.publicDrafts[DraftService.draftId];
                $scope.secretDraft = DraftService.secretDraft;
                if ($scope.publicDraft && $scope.secretDraft) {
                	var opponentIndex = $scope.secretDraft.index === 0 ? 1 : 0;
                	$scope.opponentPool = $scope.publicDraft.playerPools[opponentIndex];
                    $scope.sortedOpponentPool = CardService.sortCardList($scope.opponentPool);
                    $scope.sortedDeck = CardService.sortCardList($scope.secretDraft.deck);
                    $scope.sortedSideboard = CardService.sortCardList($scope.secretDraft.sideboard);
					if ($scope.publicDraft.type.name === "Grid") {
						initGridDraft();
					} else if ($scope.publicDraft.type.name === "Pancake") {
                        initPickBurnDraft();
					} else if ($scope.publicDraft.type.name === "BurnFour") {
                        initPickBurnDraft();
					} else if ($scope.publicDraft.type.name === "Glimpse") {
                        initPickBurnDraft();
					} else if ($scope.publicDraft.type.name === "Winston") {
					    
					} else if ($scope.publicDraft.type.name === "Winchester") {
					    
                    }
                    if (newDraft) {
                        initDraftInclude();
                    } 
                }
            }

            /**
             * Configure the controller scope for a grid draft by setting the cards in each grid.
             */
            function initGridDraft() {
                $scope.grid = [];
                //copy the grid arrays since we don't to modify the public draft's version
                $scope.grid[0] = $scope.publicDraft.currentGrid[0].slice();
                $scope.grid[1] = $scope.publicDraft.currentGrid[1].slice();
                $scope.grid[2] = $scope.publicDraft.currentGrid[2].slice();
                setLoadingStatus($scope.grid);
            }

            /**
             * Configure the pick burn controller state by setting the pack on the scope object and retrieving
             * any cards not currently stored locally.
             */
            function initPickBurnDraft() {
                $scope.pack = $scope.secretDraft.pack.slice();//make a copy
                setLoadingStatus([$scope.pack]);
                //Configure picking vs burning on the state
                $scope.cardAction = ($scope.secretDraft.picking ? $scope.pickCardName : $scope.burnCardName);
                $scope.cardActionLabel = ($scope.secretDraft.picking ? 'Pick' : 'Burn');
            }

            /**
             * Determine which cards need loaded and modify the names in each
             * list so that once they are loaded, angular knows to update the
             * card objects.
             */
            function setLoadingStatus(list) {
                let cardsToRequest = [];
                list.forEach(function(cardList, index) {
                    cardList.forEach(function(cardName, index) {
                        let card = CardService.cards[cardName];
                        if (!card || !card.id) {
                            cardsToRequest.push(cardName);
                            cardList[index] += " - Loading";//add loading until loaded
                        }
                    });
                });
                CardService.getCards(cardsToRequest);
            }

			function initDraftInclude() {
				if ($scope.publicDraft.type.name === 'Grid') {
                    $scope.draftInclude = '/app/mtg/draft/room/grid.html';
                } else if ($scope.publicDraft.type.name === 'Pancake' ||
                            $scope.publicDraft.type.name === 'BurnFour' ||
                            $scope.publicDraft.type.name === 'Glimpse') {
                    $scope.draftInclude = '/app/mtg/draft/room/pickBurn.html';
                } else if ($scope.publicDraft.type.name === 'Winston') {
                    $scope.draftInclude = '/app/mtg/draft/room/winston.html';
                } else if ($scope.publicDraft.type.name === 'Winchester') {
                    $scope.draftInclude = '/app/mtg/draft/room/winchester.html';
                } else {
                    $scope.draftInclude = '';
                }
			}
            
            $scope.draftCol = function(index) {
                socket.emit('draftCol', index);
            };
            
            $scope.draftRow = function(index) {
                socket.emit('draftRow', index);
            };
            
            $scope.pickCard = function(index) {
                socket.emit('pickCard', index);
            };
            
            $scope.burnCard = function(index) {
                socket.emit('burnCard', index);
            };
            
            $scope.pickCardName = function(cardName) {
                socket.emit('pickCardName', cardName);
            };
            
            $scope.burnCardName = function(cardName) {
                socket.emit('burnCardName', cardName);
            };
            
            $scope.moveToSideboard = function(cardName) {
                socket.emit('moveToSideboard', cardName);
            };
            
            $scope.moveToDeck = function(cardName) {
                socket.emit('moveToDeck', cardName);
            };
            
            $window.allowDrop = function(ev) {
                ev.preventDefault();
            };
            
            $window.drop = function(ev) {
                ev.preventDefault();
            };
            
            $window.drag = function(ev) {
                // var cardName = ev.target.alt;
                var cardName = ev.target.text;
                if (cardName) {
                    ev.dataTransfer.setData("text", cardName);
                } else {
                    ev.dataTransfer.setData("text", "");
                }
            };
            
            $window.dropInSideboard = function(ev) {
                ev.preventDefault();
                var cardName = ev.dataTransfer.getData("text");
                $scope.moveToSideboard(cardName);
            };
            
            $window.dropInDeck = function(ev) {
                ev.preventDefault();
                var cardName = ev.dataTransfer.getData("text");
                $scope.moveToDeck(cardName);
            };
            
            $scope.saveDeck = function() {
                socket.emit('saveDeck', fileName);
            };

            init();
            
        }
    ]);