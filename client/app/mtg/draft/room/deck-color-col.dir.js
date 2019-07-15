/*global angular*/
angular.module('mtg')
    .directive('cardCol', function() {
        return {
            restrict: 'E',
            scope: {
              colName: '=colname',//col name to be displayed ex: White
              cardList: '=cardlist',//list of card names to iterate over and display
              colType: '=coltype',//type used to keep card modals distinct
              cardService: '=cardservice',//card service used to look up additional card info
              cardAction: '=action',
              cardActionLabel: '=actionlabel'
            },
            templateUrl: 'app/mtg/draft/room/deck-color-col.dir.html'
          };
    });