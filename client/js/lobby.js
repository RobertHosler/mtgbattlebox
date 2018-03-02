

function LobbyController($scope, UserService) {
    
    var socket = UserService.socket;

    $scope.drafts = [];

    socket.on('drafts', function(draftList) {
        $scope.drafts = draftList;
        $scope.$apply();
    });

}
