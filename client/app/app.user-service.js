//Create a user service which contains the socket connection
/* global angular */
angular
  .module('myApp')
  .factory('UserService',
    function() {
      return {
        name: prompt("Who are you?", 'Anonymous-'+(Math.random() + 1).toString(36).slice(2, 18))
      };
    });
