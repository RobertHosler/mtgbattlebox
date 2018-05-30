

/* Main ctrl set at the page level to maintain global scope */
angular
.module('myApp')
.controller('MainCtrl',
    ['$scope', '$route', 'Page', 'UserService', '$location',
        function($scope, $route, Page, UserService, $location) {
            $scope.Page = Page;
            
            $scope.$on('$locationChangeSuccess', function(event, next, current) {
                if ($route.current.$$route) {
                    if ($route.current.$$route.templateUrl) {
                        if ($route.current.$$route.templateUrl.startsWith('app/mtg')) {
                            if (!$("#header").hasClass("navbar-mtg")) {
                                $("#header").addClass("navbar-mtg");
                            }
                            if (!UserService.name) {
                                $location.path('/login');
                                return;//don't do anything else, user needs to login
                            }
                        } else {
                            $("#header").removeClass("navbar-mtg");
                        }
                    }
                    Page.setTitle($route.current.$$route.pageName);
                }
            });
            
        }
    ]
);