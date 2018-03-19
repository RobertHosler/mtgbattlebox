/*global angular*/
angular
    .module('draft')
    .controller('DraftCtrl',
        ['$scope', 'UserService', 'DraftService', 'socket',
        function($scope, UserService, DraftService, socket) {
            
            function draftNotify() {
                $scope.$apply();
            }
            DraftService.register(draftNotify);
            
            $scope.draftService = DraftService;
            
            $scope.draftId = DraftService.draftId;
            $scope.cubes = DraftService.cubes;
            
        }
    ]);