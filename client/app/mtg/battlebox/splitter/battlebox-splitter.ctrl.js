/*global angular*/
angular
    .module('battlebox')
    .controller('BattleboxSplitController',
        ['$scope', 'socket', 'BattleboxService',
        function($scope, socket, BattleboxService) {
            
            function callback() {
                $scope.$apply();
            }
            BattleboxService.register(callback);

            $scope.selectedBox;
            $scope.addLands = true;
            $scope.addOnes = true;
            $scope.battleboxService = BattleboxService;
            $scope.playerOne = 'Player One Half';
            $scope.playerTwo = 'Player Two Half';

            $scope.split = function split() {
                // console.log('Sending message:', $scope.text);
                if ($scope.selectedBox) {
                    var options = {
                        "addOnes": $scope.addOnes,
                        "addLands": $scope.addLands
                    };
                    socket.emit('split', $scope.selectedBox, options);
                }
            };

            socket.on('split', function(splitResults) {
                $scope.playerOne = splitResults[0];
                $scope.playerTwo = splitResults[1];
                $scope.$apply();
            });

        }
    ]);
