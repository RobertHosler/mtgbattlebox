/* global angular */
angular
    .module('myApp')
    .run(function($rootScope) {
        $rootScope.angular = angular;
    });
