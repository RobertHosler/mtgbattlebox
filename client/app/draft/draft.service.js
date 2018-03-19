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
                }
                
                function notifyObservers() {
                    self.observers.forEach(function(observer) {
                        observer();
                    });
                }
                
            }

            /*var draftStuff = {
                draftTypes: [],
                cubes: [],
                secretDraft: {},
                publicDrafts: {},
                draftId: ''
                // draftNotify: function() {
                //     observers.forEach(function(observer) {
                //         observer();
                //     });
                // },
                // register: function(observer) {
                //     observers.push[observer];
                //     this.observers.push[observer];
                //     draftStuff.observers.push[observer];
                //     var i = 1 + 2;
                // },
                // disconnect: function(observer) {
                //     observers.splice(observers.indexOf(observer), 1);
                // }
            };

            socket.on('drafts', function(publicDrafts) {
                draftStuff.publicDrafts = publicDrafts;
                // notifyObservers();
            });

            socket.on('draftTypes', function(draftTypeList) {
                draftStuff.draftTypes = draftTypeList;
                // notifyObservers();
            });

            socket.on('cubes', function(cubeList) {
                draftStuff.cubes = cubeList;
                // notifyObservers();
            });

            socket.on('draftUpdate', function(draftId, secretUpdate) {
                draftStuff.draftId = draftId;
                draftStuff.secretDraft = secretUpdate;
                // notifyObservers();
            });*/
            
            return new DraftService(socket);
        }
    ]);
