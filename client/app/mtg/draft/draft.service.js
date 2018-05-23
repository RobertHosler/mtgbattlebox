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
                self.publicDrafts = [];
                self.publicDraft = {};
                self.secretDraft = {};
                
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
    
                socket.on('draftUpdate', function(draftPublic, draftSecret, publicDrafts) {
                    self.draftId = draftPublic.id;
                    self.publicDraft = draftPublic;
                    self.secretDraft = draftSecret;
                    self.publicDrafts = publicDrafts;
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
                
                socket.on('deckSaved', function(fileName) {
    				var a = document.createElement('A');
    				a.href = fileName; //full path
    				a.download = fileName.substr(fileName.lastIndexOf('/') + 1); //file name
    				a.target = "_blank"; //target parameter ignores angular redirects
    				document.body.appendChild(a);
    				a.click();
    				document.body.removeChild(a);
                });
                
                socket.emit('getDraftStuff');
                
            }

            return new DraftService(socket);
        }
    ]);
