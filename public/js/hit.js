(function($) {

    // Login
    var loginCtrl = function($scope, $routeParams) {
        $scope.failed = false;
        $scope.login = function(user) {
            $scope.failed = false;
            if($scope.loginForm.$valid) {
                Hit.User.logIn(user.email, user.password).done(function() {
                    window.location.href = '/#/venues';
                }).fail(function() {
                    $scope.failed = true;
                    $scope.$apply();
                });
            }
        };
    };

    angular.module('hit', []).
        config(['$routeProvider', function($routeProvider) {
            $routeProvider.
            when('/login', {templateUrl: 'partials/login.html',   controller: loginCtrl}).
            when('/venues', {templateUrl: 'partials/venues.html', controller: loginCtrl}).
            otherwise({redirectTo: '/login'});
    }]);

})(jQuery);