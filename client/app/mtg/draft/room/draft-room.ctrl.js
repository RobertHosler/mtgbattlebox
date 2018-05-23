/*global angular*/
/*global $*/
angular
    .module('draft')
    .controller('DraftCtrl',
        ['$scope', 'UserService', 'DraftService', 'socket', 'CardService', '$location', '$window',
        function($scope, UserService, DraftService, socket, CardService, $location, $window) {
            
            // if (!DraftService.draftId) {
            //     console.log("No Draft Id");
            //     $location.path('/createDraft');
            //     return;
            // }
            
            if (!UserService.name) {
                $location.path('/login');
            }
            
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
            
            $scope.draftService = DraftService;
            $scope.cardService = CardService;
            
    		var dt = new Date();
    		var date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
	        var fileName;
            
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
            	$scope.draftId = DraftService.draftId;
                $scope.publicDraft = DraftService.publicDrafts[DraftService.draftId];
                $scope.secretDraft = DraftService.secretDraft;
                if ($scope.secretDraft) {
                    $scope.sortedDeck = CardService.sortCardList($scope.secretDraft.deck);
                    $scope.sortedSideboard = CardService.sortCardList($scope.secretDraft.sideboard);
                }
                if ($scope.publicDraft && $scope.secretDraft) {
                	var opponentIndex = $scope.secretDraft.index === 0 ? 1 : 0;
                	$scope.opponentPool = $scope.publicDraft.playerPools[opponentIndex];
                    $scope.sortedOpponentPool = CardService.sortCardList($scope.opponentPool);
					if ($scope.publicDraft.type.name === "Grid") {
						$scope.grid = $scope.publicDraft.currentGrid;
						CardService.getCards($scope.grid[0]);
						CardService.getCards($scope.grid[1]);
						CardService.getCards($scope.grid[2]);
					} else if ($scope.publicDraft.type.name === "Pancake") {
					    $scope.pack = $scope.secretDraft.pack;
						CardService.getCards($scope.pack);
						$scope.cardAction = ($scope.secretDraft.picking ? $scope.pickCardName : $scope.burnCardName);
						$scope.cardActionLabel = ($scope.secretDraft.picking ? 'Pick' : 'Burn');
					} else if ($scope.publicDraft.type.name === "BurnFour") {
					    $scope.pack = $scope.secretDraft.pack;
						CardService.getCards($scope.pack);
					} else if ($scope.publicDraft.type.name === "Glimpse") {
					    $scope.pack = $scope.secretDraft.pack;
						CardService.getCards($scope.pack);
					} else if ($scope.publicDraft.type.name === "Winston") {
					    
					} else if ($scope.publicDraft.type.name === "Winchester") {
					    
					}
                }
            }
            
            $scope.getDraftInclude = function() {
                if (!$scope.publicDraft) {
                    return '';
                } else if ($scope.publicDraft.type.name === 'Grid') {
                    return '/app/mtg/draft/room/grid.html';
                } else if ($scope.publicDraft.type.name === 'Pancake' ||
                            $scope.publicDraft.type.name === 'BurnFour' ||
                            $scope.publicDraft.type.name === 'Glimpse') {
                    return '/app/mtg/draft/room/pickBurn.html';
                } else if ($scope.publicDraft.type.name === 'Winston') {
                    return '/app/mtg/draft/room/winston.html';
                } else if ($scope.publicDraft.type.name === 'Winchester') {
                    return '/app/mtg/draft/room/winchester.html';
                } else {
                    return '';
                }
            };
            
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