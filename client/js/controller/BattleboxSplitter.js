function copyToClipboard(target) {
    var copyText = document.getElementById(target);
    copyText.select();
    document.execCommand('Copy');
    // alert("Copied");
    // $('#'+target).blur();//unselect text
}

function BattleboxSplitController($scope, UserService) {
    
    var socket = UserService.socket;
    $scope.selectedBox;
    $scope.addLands = true;
    $scope.addOnes = true;
    $scope.battleboxes = [];
    $scope.playerOne = 'Player One Half';
    $scope.playerTwo = 'Player Two Half';
    
    socket.on('battleboxes', function(battleboxList) {
        $scope.battleboxes = battleboxList;
        // if (!$scope.selectedCube) {
            // $scope.selectedCube = cubeList[0];
        // }
        $scope.$apply();
    });
    
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