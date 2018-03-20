/* global angular */
angular.module('battlebox')
    .factory('BattleboxService', ['socket',
        function(socket) {

            function BattleboxService(socket) {
                var self = this;
                self.battleboxes = [];
                self.observers = [];

                socket.on('battleboxes', function(battleboxList) {
                    self.battleboxes = battleboxList;
                    notifyObservers();
                });

                self.register = function(observer) {
                    self.observers.push(observer);
                };

                self.disconnect = function(observer) {
                    self.observers.splice(self.observers.indexOf(observer), 1);
                };

                function notifyObservers() {
                    self.observers.forEach(function(observer) {
                        observer();
                    });
                }

                socket.emit('getBattleboxStuff');

            }

            return new BattleboxService(socket);
        }
    ]);
