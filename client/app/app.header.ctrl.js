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
                                    { href: 'mtg/draft/create', label: 'Draft Cube'},
                                    { href: 'mtg/battlebox/split', label: 'Battlebox Splitter'}
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
                                    { href: 'mtg/draft/create', label: 'Gaming'},
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