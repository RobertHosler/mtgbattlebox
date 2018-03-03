

function LobbyController($scope, UserService) {
    
    var socket = UserService.socket;

    $scope.drafts = [];

    socket.on('drafts', function(draftList) {
        $scope.drafts = draftList;
        $scope.$apply();
    });

}

function copyToClipboard(target) {
    var copyText = document.getElementById(target);
    copyText.select();
    document.execCommand('Copy');
    // alert("Copied");
    // $('#'+target).blur();//unselect text
}