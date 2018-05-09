/*global angular*/
angular
    .module('login')
    .controller('LoginController',
        ['$scope', 'socket', 'UserService', '$location',
        function($scope, socket, UserService, $location) {
            
            $scope.user;
            $scope.password;
            
            $scope.login = function login() {
                if ($scope.user) {
                    UserService.name = $scope.user;
                    socket.emit('setName', $scope.user);
                    $location.path('/createDraft');
                } else {
                    alert("Username is required!");
                }
            };

        }
    ]);
