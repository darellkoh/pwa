app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state, OrderFactory, NavFactory) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function (scope) {

            scope.items = [
                { label: 'Home', state: 'home' },
                { label: 'About', state: 'about' },
                { label: 'Work', state: 'work' },
            ];

           // scope.clickedMenuIcon = false;

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                   $state.go('home');
                });
            };

            var setUser = function () {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function () {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        },
        controller: function($scope){
           $scope.showCart = OrderFactory.getShowCart;
           $scope.toggleCartView = OrderFactory.toggleShowCart;
           $scope.totalQuantity = OrderFactory.totalQuantity;
           $scope.isLoggedIn = NavFactory.isLoggedIn;
           $scope.setSignUp = NavFactory.setSignUp;
           $scope.getSignUp = NavFactory.getSignUp;
           $scope.getLogin = NavFactory.getLogin;
           $scope.getLoggedIn = NavFactory.getLoggedIn;
        }

    };

});
