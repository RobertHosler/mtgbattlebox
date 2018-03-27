/*global angular*/
angular.module('mtg')
    .directive('cardText', function() {
        return {
            restrict: 'E',
            scope: {
              id: '=id',
              card: '=card',
              cardService: '=cardservice'
            },
            templateUrl: 'app/core/mtg/card-text.dir.html'
          };
    });