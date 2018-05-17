//Create a user service which contains the socket connection
/* global io */
/* global angular */
angular
    .module('myApp')
    .factory('socket',
        ['$location',
        function($location) {
            var socket = io.connect();
            socket.on('connect', function() {
                //any initial connection
            });
            socket.on('shutdown', function() {
                //any initial connection
                alert("App has shutdown");
            });
            return socket;
        }]);
