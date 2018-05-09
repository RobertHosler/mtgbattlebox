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


angular
.module('myApp')
.filter('trustedhtml',
    function($sce) {
        return $sce.trustAsHtml; 
});