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
                .when("/login", {
                    templateUrl: 'app/login/login.ctrl.html',
                    controller: 'LoginController',
                    pageName: "Login"
                })
                .when("/chat", {
                    templateUrl: 'app/chat/chat.pg.html',
                    controller: 'ChatController',
                    pageName: "Chat"
                })
                .when("/createDraft", {
                    templateUrl: 'app/mtg/draft/create/create-draft.pg.html',
                    controller: 'CreateDraftController',
                    pageName: "Create Draft"
                })
                .when("/draftRoom", {
                    templateUrl: 'app/mtg/draft/room/draft-room.pg.html',
                    controller: 'DraftCtrl',
                    pageName: "Draft Room"
                })
                .when("/joinDraft", {
                    templateUrl: 'app/mtg/draft/join/join-draft.pg.html',
                    controller: 'JoinDraftController',
                    pageName: "Join Draft"
                })
                .when("/splitBattlebox", {
                    templateUrl: 'app/mtg/battlebox/splitter/battlebox-splitter.ctrl.html',
                    controller: 'BattleboxSplitController',
                    pageName: 'Split Battlebox'
                })
                .otherwise({ redirectTo: '/createDraft' });

            // use the HTML5 History API
            $locationProvider.html5Mode(true);
        }
    ]);