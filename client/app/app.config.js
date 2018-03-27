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
                    templateUrl: 'app/chat/chat.pg.html',
                    controller: 'ChatController',
                    pageName: "Chat"
                })
                .when("/createDraft", {
                    templateUrl: 'app/draft/createDraft/createDraft.html',
                    controller: 'CreateDraftController',
                    pageName: "Create Draft"
                })
                .when("/draftRoom", {
                    templateUrl: 'app/draft/draftRoom/draftRoom.html',
                    controller: 'DraftCtrl',
                    pageName: "Draft Room"
                })
                .when("/joinDraft", {
                    templateUrl: 'app/draft/joinDraft/joinDraft.pg.html',
                    controller: 'LobbyController',
                    pageName: "Join Draft"
                })
                .when("/splitBattlebox", {
                    templateUrl: 'app/battlebox/splitter/splitBattlebox.html',
                    controller: 'BattleboxSplitController',
                    pageName: 'Split Battlebox'
                })
                .otherwise({ redirectTo: '/createDraft' });

            // use the HTML5 History API
            $locationProvider.html5Mode(true);
        }
    ]);
