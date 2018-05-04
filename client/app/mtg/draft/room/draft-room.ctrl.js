/*global angular*/
angular
    .module('draft')
    .controller('DraftCtrl',
        ['$scope', 'UserService', 'DraftService', 'socket', 'CardService', '$location',
        function($scope, UserService, DraftService, socket, CardService, $location) {
            
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
            
        }
    ]);