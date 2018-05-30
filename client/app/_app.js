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
    ['$scope',
        function($scope) {
            
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
        setTitle: function(newTitle) { title = newTitle }
    };
});

/* Main ctrl set at the page level to maintain global scope */
angular
.module('myApp')
.controller('MainCtrl',
    ['$scope', '$route', 'Page',
        function($scope, $route, Page) {
            $scope.Page = Page;
            
            $scope.$on('$locationChangeSuccess', function(event, next, current) {
                if ($route.current.$$route) {
                    Page.setTitle($route.current.$$route.pageName);
                }
            });
            
        }
    ]
);

angular
.module('myApp')
.filter('trustedhtml',
    function($sce) {
        return $sce.trustAsHtml; 
});