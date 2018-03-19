/* global angular */
angular
    .module('myApp')
    .config(['$routeProvider', '$locationProvider',
        function config($routeProvider, $locationProvider) {
            //Configure the application based on the path
            $routeProvider
                // .when("/", {
                //   templateUrl : 'partials/home.html',
                //   controller : LobbyController
                // })
                .when("/chat", {
                    templateUrl: 'pages/justChat.html',
                    controller: 'ChatController',
                    pageName: "Chat"
                })
                .when("/createDraft", {
                    templateUrl: 'pages/createDraft.html',
                    controller: 'CreateDraftController',
                    pageName: "Create Draft"
                })
                .when("/draftRoom", {
                    templateUrl: 'pages/draftRoom.html',
                    controller: 'DraftCtrl',
                    pageName: "Draft Room"
                })
                .when("/joinDraft", {
                    templateUrl: 'pages/joinDraft.html',
                    controller: 'LobbyController',
                    pageName: "Join Draft"
                })
                .when("/splitBattlebox", {
                    templateUrl: 'pages/splitBattlebox.html',
                    controller: 'BattleboxSplitController',
                    pageName: 'Split Battlebox'
                })
                .otherwise({ redirectTo: '/chat' });

            // use the HTML5 History API
            $locationProvider.html5Mode(true);
        }
    ]);
