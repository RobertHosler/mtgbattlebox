var myApp = angular.module('myApp',[]);
myApp.factory('UserService', function() {
  return {
      name : 'Anonymous',
      socket : io.connect()
  };
});