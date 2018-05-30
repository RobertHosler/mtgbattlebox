/* global angular */
angular
    .module('myApp')
    .config(['$routeProvider', '$locationProvider',
        function config($routeProvider, $locationProvider) {
            //Configure the application based on the path
            $routeProvider
                .when("/home", {
                    templateUrl: 'app/pages/home.html',
                    pageName: "Home"
                })
                
                //About Pages
                .when("/about", {
                    templateUrl: 'app/pages/about.html',
                    pageName: "About"
                })
                .when("/about/art", {
                    templateUrl: 'app/pages/art.html',
                    pageName: "Art Portfolio"
                })
                .when("/about/resume", {
                    templateUrl: 'app/pages/resume.html',
                    pageName: "Résumé"
                })
                .when("/about/dev", {
                    templateUrl: 'app/pages/dev.html',
                    pageName: "Development Portfolio"
                })
                .when("/about/contact", {
                    templateUrl: 'app/pages/contact.html',
                    pageName: "Contact"
                })
                
                //App pages
                .when("/login", {
                    templateUrl: 'app/login/login.ctrl.html',
                    // controller: 'LoginController',
                    pageName: "Login"
                })
                .when("/chat", {
                    templateUrl: 'app/chat/chat.pg.html',
                    // controller: 'ChatController',
                    pageName: "Chat"
                })
                // .when("/createDraft", {
                //     templateUrl: 'app/mtg/draft/create/create-draft.pg.html',
                //     // controller: 'CreateDraftController',
                //     pageName: "Create Draft"
                // })
                
                //MTG Pages
                .when("/mtg", {
                    templateUrl: 'app/mtg/index.html',
                    pageName: "mtg"
                })
                .when("/mtg/draft", {
                    templateUrl: 'app/mtg/draft/create/create-draft.pg.html',
                    pageName: "Create Draft"
                })
                .when("/mtg/draft/create", {
                    templateUrl: 'app/mtg/draft/create/create-draft.pg.html',
                    pageName: "Create Draft"
                })
                .when("/mtg/draft/room", {
                    templateUrl: 'app/mtg/draft/room/draft-room.pg.html',
                    // controller: 'DraftCtrl',
                    pageName: "Draft Room"
                })
                .when("/mtg/draft/join", {
                    templateUrl: 'app/mtg/draft/join/join-draft.pg.html',
                    // controller: 'JoinDraftController',
                    pageName: "Join Draft"
                })
                .when("/mtg/battlebox/split", {
                    templateUrl: 'app/mtg/battlebox/splitter/battlebox-splitter.ctrl.html',
                    // controller: 'BattleboxSplitController',
                    pageName: 'Split Battlebox'
                })
                .when("/mtg/cube/add", {
                    templateUrl: 'app/pages/placeholder.html',
                    // controller: 'JoinDraftController',
                    pageName: "Add Cube"
                })
                .when("/mtg/cube/edit", {
                    templateUrl: 'app/pages/placeholder.html',
                    // controller: 'JoinDraftController',
                    pageName: "Edit Cube"
                })
                .when("/mtg/cube/view", {
                    templateUrl: 'app/pages/placeholder.html',
                    // controller: 'JoinDraftController',
                    pageName: "View Cube"
                })
                .otherwise({ redirectTo: '/home' });

            // use the HTML5 History API
            $locationProvider.html5Mode(true);
        }
    ]);