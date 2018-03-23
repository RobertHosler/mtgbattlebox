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
            
            $scope.joinDraft = function(draftId) {
                $scope.draftService.draftId = draftId;
                $location.path('/draftRoom');
                socket.emit('joinDraft', UserService.name, draftId);
            };

        }
    ]);
