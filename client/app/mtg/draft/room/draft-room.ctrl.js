/*global angular*/
angular
    .module('draft')
    .controller('DraftCtrl',
        ['$scope', 'UserService', 'DraftService', 'socket', 'CardService', '$location', '$window',
        function($scope, UserService, DraftService, socket, CardService, $location, $window) {
            
            if (!DraftService.draftId) {
                console.log("No Draft Id");
                $location.path('/createDraft');
            }
            
            function serviceUpdate() {
                init();
                $scope.$apply();
            }
            
            DraftService.register(serviceUpdate);
            CardService.register(serviceUpdate);
            $scope.draftService = DraftService;
            $scope.cardService = CardService;
            
            $scope.draftId = DraftService.draftId;
            $scope.cubes = DraftService.cubes;
            
            init();
            
            /**
             * Function to be run on page load and whenever there is a service update
             * to make sure that scope variables are properly set
             */
            function init() {
                $scope.publicDraft = DraftService.publicDrafts[DraftService.draftId];
                $scope.secretDraft = DraftService.secretDraft;
                $scope.sortedDeck = CardService.sortCardList($scope.secretDraft.deck);
                $scope.sortedSideboard = CardService.sortCardList($scope.secretDraft.sideboard);
                if ($scope.publicDraft && $scope.publicDraft.type.name === "Grid") {
                    $scope.grid = $scope.publicDraft.currentGrid;
                    CardService.getCards($scope.grid[0]);
                    CardService.getCards($scope.grid[1]);
                    CardService.getCards($scope.grid[2]);
                }
            }
            
            $scope.getDraftInclude = function() {
                if (!$scope.publicDraft) {
                    return '';
                } else if ($scope.publicDraft.type.name === 'Grid') {
                    return '/app/mtg/draft/room/grid.html';
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
            
            $scope.moveToSideboard = function(cardName) {
                socket.emit('moveToSideboard', cardName);
            };
            
            $scope.moveToDeck = function(cardName) {
                socket.emit('moveToDeck', cardName);
            };
            
            $window.allowDrop = function(ev) {
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
            
        }
    ]);