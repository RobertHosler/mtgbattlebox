function ChatController($scope, UserService) {
    
    var socket = UserService.socket;
    $scope.messages = [];
    $scope.roster = [];
    $scope.name = '';
    $scope.text = '';

    socket.on('message', function(msg) {
        $scope.messages.push(msg);
        $scope.$apply();
        //TODO: modifying the dom is not recommended in controllers. is this considered modifying the dom?
        var lastRow = $(".scrollable-chat tbody tr:last-child")[0];
        if (lastRow) {
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