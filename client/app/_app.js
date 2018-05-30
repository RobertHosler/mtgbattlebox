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

angular
.module('myApp')
.filter('trustedhtml',
    function($sce) {
        return $sce.trustAsHtml; 
});