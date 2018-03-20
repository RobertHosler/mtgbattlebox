/* global angular */
angular.module('draft')
    .factory('DraftService', ['socket',
        function(socket) {
            
            function DraftService(socket) {
                var self = this;
                self.draftTypes = [];
                self.cubes = [];
                self.draftId = '';
                self.observers = [];
                
                socket.on('drafts', function(publicDrafts) {
                    self.publicDrafts = publicDrafts;
                    notifyObservers();
                });
    
                socket.on('draftTypes', function(draftTypeList) {
                    self.draftTypes = draftTypeList;
                    notifyObservers();
                });
    
                socket.on('cubes', function(cubeList) {
                    self.cubes = cubeList;
                    notifyObservers();
                });
    
                socket.on('draftUpdate', function(draftId, secretUpdate) {
                    self.draftId = draftId;
                    self.secretDraft = secretUpdate;
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
                
                socket.emit('getDraftStuff');
                
            }

            return new DraftService(socket);
        }
    ]);
