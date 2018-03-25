/*global angular*/
angular.module('mtg')
    .directive('cardImage', function() {
        return {
            restrict: 'E',
            scope: {
              id: '=id',
              card: '=card',
              cardService: '=cardservice'
            },
            templateUrl: 'sections/mtg/card.html'
          };
    });