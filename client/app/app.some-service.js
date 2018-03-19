//create some service which does something
/* global angular */
angular.module('myApp').factory('someService', function() {
    return {
        doSomething: function() {
            alert("doing something");
        }
    };
});

//Inject your service here
angular.module('myApp').run(function($rootScope, someService) {
    //Look for successful state change.
    //For your ref. on other events.
    //https://github.com/angular-ui/ui-router/wiki#state-change-events
    $rootScope.$on('$stateChangeSuccess', function() {
        //If you don't wanna create the service, you can directly write
        // your function here.
        someService.doSomething();
    });
});
