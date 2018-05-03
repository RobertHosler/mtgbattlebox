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
            templateUrl: 'app/mtg/card/card-text.dir.html'
          };
    });