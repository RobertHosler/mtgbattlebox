/*global angular*/
/*global $*/
angular
    .module('chat')
    .controller('ChatController',
        ['$scope', 'UserService',
        function($scope, UserService) {

            var socket = UserService.socket;
            $scope.messages = [];
            $scope.roster = [];
            $scope.name = '';
            $scope.text = '';
            $scope.autoScroll = true;

            socket.on('message', function(msg) {
                $scope.messages.push(msg);
                $scope.$apply();
                //TODO: modifying the dom is not recommended in controllers. is this considered modifying the dom?
                var lastRow = $(".scrollable-chat tbody tr:last-child")[0];
                if (lastRow && $scope.autoScroll) {
                    lastRow.scrollIntoView();
                }
            });

            socket.on('roster', function(names) {
                $scope.roster = names;
                $scope.$apply();
            });

            $scope.send = function send() {
                // console.log('Sending message:', $scope.text);
                socket.emit('message', $scope.text);
                $scope.text = '';
            };

            $scope.setName = function setName() {
                socket.emit('identify', $scope.name);
                UserService.name = $scope.name;
            };
        }
    ]);
