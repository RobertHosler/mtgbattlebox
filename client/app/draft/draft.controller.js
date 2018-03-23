/*global angular*/
angular
    .module('draft')
    .controller('DraftCtrl',
        ['$scope', 'UserService', 'DraftService', 'socket', 'CardService',
        function($scope, UserService, DraftService, socket, CardService) {
            
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
            $scope.secretDraft = DraftService.secretDraft;
            
            init();
            
            /**
             * Function to be run on page load and whenever there is a service update
             * to make sure that scope variables are properly set
             */
            function init() {
                $scope.publicDraft = DraftService.publicDrafts[DraftService.draftId];
                if ($scope.publicDraft && $scope.publicDraft.type.name === "Grid") {
                    $scope.grid = $scope.publicDraft.currentGrid;
                    CardService.getCards($scope.grid[0]);
                    CardService.getCards($scope.grid[1]);
                    CardService.getCards($scope.grid[2]);
                }
            }
            
        }
    ]);