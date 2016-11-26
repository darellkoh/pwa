'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

// app.filter( 'priceFilter', function(){
//     return function(amount){
//         return '$' + (amount/100).toFixed(2);
//     }
// })

app.config(function ($urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
    $urlRouterProvider.when('/auth/:provider', function () {
        window.location.reload();
    });
});


app.run(function ($rootScope, AuthService, $state, OrderFactory, NavFactory) {

    OrderFactory.getSessionCart();
    AuthService.getLoggedInUser()
    .then(function(user){
        NavFactory.setUser(user);
    })


    var destinationStateRequiresAuth = function (state) {
        return state.data && state.data.authenticate;
    };


    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            return;
        }

        if (AuthService.isAuthenticated()) {
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });

    });

});
