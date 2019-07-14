/*global angular*/
angular
    .module('draft')
    .controller('CreateDraftController',
        ['$scope', 'UserService', '$location', 'DraftService', 'socket', '$route', 'Page',
        function($scope, UserService, $location, DraftService, socket, $route, Page) {
            
            function draftNotify() {
                $scope.$apply();
            }
            
            DraftService.register(draftNotify);
            socket.emit('getDraftStuff');
            
			// Unregister
			$scope.$on('$destroy', function () {
				DraftService.disconnect(draftNotify);
			});
            
            $scope.draftService = DraftService;

            $scope.selectedDraftType = '';
            $scope.selectedCube = {};

            socket.on('draftTypes', function(draftTypeList) {
                $scope.draftTypes = draftTypeList;
                $scope.$apply();
            });

            socket.on('cubes', function(cubeList) {
                $scope.cubes = cubeList;
                // if (!$scope.selectedCube) {
                // $scope.selectedCube = cubeList[0];
                // }
                $scope.$apply();
            });

            /**
             * Send the username, draft type, and selected cube to the server.
             * Change the page to the draft room.
             */
            $scope.createDraft = function() {
                console.log('Creating draft:', UserService.name, $scope.selectedDraftType, $scope.selectedCube);
                socket.emit('createDraft', UserService.name, $scope.selectedDraftType, $scope.selectedCube);
                delete DraftService.draftId;
                $location.path('/mtg/draft/room');//change the location
            };

        }
    ]);