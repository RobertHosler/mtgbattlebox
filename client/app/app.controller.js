/* global angular */
angular
    .module('myApp')
    .controller('AppController',
        ['$scope',
        function($scope) {
            $scope.test = "test string";
        }
    ]);