//Create a user service which contains the socket connection
/* global io */
/* global angular */
angular
    .module('myApp')
    .factory('socket',
        function() {
            var socket = io.connect();
            socket.on('connect', function() {
                //any initial connection
            });
            return socket;
        });
