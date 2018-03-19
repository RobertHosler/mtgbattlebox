//Create a user service which contains the socket connection
/* global angular */
angular
  .module('myApp')
  .factory('UserService',
    function() {
      return {
        name: 'Anonymous'
      };
    });
