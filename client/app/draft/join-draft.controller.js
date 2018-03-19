/*global angular*/
angular
    .module('draft')
    .controller('JoinDraftController',
        ['$scope', 'UserService', '$location', 'DraftService', 'socket',
        function($scope, UserService, $location, DraftService, socket) {
            
            function draftNotify() {
                $scope.$apply();
            }
            DraftService.register(draftNotify);
            
            $scope.draftService = DraftService;

        }
    ]);
