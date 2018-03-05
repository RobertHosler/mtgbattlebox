var myApp = angular.module('myApp',[]);
myApp.config(function($routeProvider, $locationProvider) {
  $routeProvider
    // .when("/", {
    //   templateUrl : 'partials/home.html',
    //   controller : LobbyController
    // })
    .when("/chat", {
      templateUrl : 'pages/justChat.html',
      controller : ChatController,
      pageName : "Chat"
    })
    .when("/createDraft", {
      templateUrl : 'pages/createDraft.html',
      controller : CreateDraftController,
      pageName : "Create Draft"
    })
    .when("/joinDraft", {
      templateUrl : 'pages/joinDraft.html',
      controller : LobbyController,
      pageName : "Join Draft"
    })
    .when("/splitBattlebox", {
      templateUrl : 'pages/splitBattlebox.html',
      controller : LobbyController
    })
    .otherwise({redirectTo: '/'});

    
  // use the HTML5 History API
  $locationProvider.html5Mode(true);
});
myApp.factory('UserService', function() {
  return {
      name : 'Anonymous',
      socket : io.connect()
  };
});