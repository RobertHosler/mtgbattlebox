//Create a user service which contains the socket connection
/* global angular */
angular
  .module('myApp')
  .factory('UserService', ['socket',
    function(socket) {
      function UserService(socket) {
        var self = this;
        self.name;
        //= prompt("Who are you?", 'Anonymous-'+(Math.random() + 1).toString(36).slice(2, 18));
        // socket.emit('setName', self.name);
      }
      return new UserService(socket);
    }]);
