/* global angular */
angular.module('myApp', [
  'chat',
  'mtg',
  'login'
//   'ngRoute'
]);


angular
.module('myApp')
.controller('HeaderCtrl',
    ['$scope', '$route',
        function($scope, $route) {

            function init() {
                if ($route.current && $route.current.$$route) {
                    if ($route.current.$$route.section) {
                        switch ($route.current.$$route.section) {
                            case "mtg":
                                console.log("mtg");
                                $scope.links = [
                                    { href: 'mtg', label: 'MTG'},
                                    { href: 'mtg/draft/create', label: 'Create Draft'},
                                    { href: 'mtg/draft/join', label: 'Join Draft'}
                                ];
                                break;
                            case "about":
                                console.log("about");
                                $scope.links = [
                                    { href: 'about', label: 'About me'},
                                    { href: 'about/art', label: 'Art'},
                                    { href: 'about/resume', label: 'Resume'},
                                    { href: 'about/contact', label: 'Contact'}
                                ];
                                break;
                            case "main":
                            default:
                                console.log("home");
                                $scope.links = [
                                    { href: 'about/resume', label: 'Programming'},
                                    { href: 'mtg', label: 'Gaming'},
                                    { href: 'about/art', label: 'Art'},
                                    { href: 'about', label: 'About'}
                                ];
                        }
                    }
                }
            }
            
            $scope.$on('$locationChangeSuccess', function(event, next, current) {
                init();
            });

            init();
                
        }
    ]
);

/* Service for managing the page title. */
angular
.module('myApp')
.factory('Page', function() {
    var title = 'default';
    return {
        title: function() { return title; },
        setTitle: function(newTitle) { title = newTitle; }
    };
});

angular
.module('myApp')
.filter('trustedhtml',
    function($sce) {
        return $sce.trustAsHtml; 
});