/*global angular*/
angular.module('mtg')
    .directive('hires', function() {
      return {
        restrict: 'A',
        scope: { hires: '@' },
        link: function(scope, element, attrs) {
            element.one('load', function() {
                console.log("Loaded", scope.hires);
                element.attr('src', scope.hires);
            });
        }
      };
    });