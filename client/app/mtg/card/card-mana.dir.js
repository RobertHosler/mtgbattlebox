/*global angular*/
angular.module('mtg')
    .directive('cardMana', function() {
        return {
            restrict: 'E',
            scope: {
              id: '=id',
              card: '=card',
              cardService: '=cardservice'
            },
            templateUrl: 'app/mtg/card/card-mana.dir.html'
          };
    });