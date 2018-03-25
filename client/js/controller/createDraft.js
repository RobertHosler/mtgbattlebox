function CreateDraftController($scope, UserService) {
    
    var socket = UserService.socket;
    $scope.draftTypes = [];
    $scope.selectedDraftType = $scope.draftTypes[0];
    $scope.selectedCube = {};
    $scope.cubes = [];
    $scope.secretDraft = {};
    $scope.publicDrafts = {};
    $scope.draftId = '';

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

    $scope.createDraft = function createDraft() {
        console.log('Creating draft:', $scope.selectedCube.name, $scope.selectedDraftType);
        socket.emit('createDraft', UserService.name, $scope.selectedDraftType, $scope.selectedCube);
        $location.path('/draftRoom');
    };
    
    socket.on('draftUpdate', function(draftId, secretUpdate) {
        $scope.draftId = draftId;
        $scope.secretDraft = secretUpdate;
        $scope.$apply();
    });

    socket.on('drafts', function(publicDrafts) {
        $scope.publicDrafts = publicDrafts;
        $scope.$apply();
        
    });

}