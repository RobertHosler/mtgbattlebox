/*global angular*/
angular
    .module('draft')
    .controller('CreateDraftController',
        ['$scope', 'UserService', '$location', 'DraftService', 'socket', '$route', 'Page',
        function($scope, UserService, $location, DraftService, socket, $route, Page) {
            
            if (!UserService.name) {
                $location.path('/login');
            }
            
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

            $scope.createDraft = function() {
                console.log('Creating draft:', $scope.selectedCube.name, $scope.selectedDraftType);
                $scope.draftService.draftId;
                socket.emit('createDraft', UserService.name, $scope.selectedDraftType, $scope.selectedCube);
                $location.path('/draftRoom');
                console.log($scope.test);
            };

        }
    ]);