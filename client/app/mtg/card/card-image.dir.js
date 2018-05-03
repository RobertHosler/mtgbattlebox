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
            templateUrl: 'app/mtg/card/card-image.dir.html'
          };
    });