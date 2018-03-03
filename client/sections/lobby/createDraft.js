function CreateDraftController($scope, UserService) {
    
    var socket = UserService.socket;
    $scope.draftTypes = [
        { name: 'Winston', description: 'Take turns looking through 3 piles of cards refiled with the pool of extra cards.' },
        { name: 'Grid', description: 'Take turns picking a row or column from a grid of 9 cards.' },
        { name: 'Pancake', description: '9 Rounds of 3 turns\nPack size 11 cards\nTurn 1 Each player takes 1 card then passes the pack to the other player.\nTurn 2 Each player takes 2 cards then burns 2 and passes back to the other player.\nTurn 3 each player takes 2 cards then discards the remaining card.\nEach player will draft 45 cards total.' }
    ];
    $scope.selectedDraftType = $scope.draftTypes[0];
    $scope.selectedCube = {};
    $scope.cubes = [];

    socket.on('cubes', function(cubeList) {
        $scope.cubes = cubeList;
        // if (!$scope.selectedCube) {
            // $scope.selectedCube = cubeList[0];
        // }
        $scope.$apply();
    });

    $scope.createDraft = function createDraft() {
        console.log('Creating draft:', $scope.selectedCube.name, $scope.selectedDraftType);
        socket.emit('createDraft', UserService.name, $scope.selectedDraftType, $scope.selectedCube);
    };

}
