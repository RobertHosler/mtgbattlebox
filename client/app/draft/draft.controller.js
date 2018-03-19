/*global angular*/
angular
    .module('draft')
    .controller('DraftCtrl',
        ['$scope', 'UserService', 'DraftService',
        function($scope, UserService, DraftService) {

            var socket = UserService.socket;
            $scope.draftId = DraftService.draftId
            
        }
    ]);