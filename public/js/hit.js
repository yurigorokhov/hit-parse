(function($) {

    

    // Login
    var loginCtrl = function($scope, $routeParams) {
        var currentUser = Hit.User.getCurrent();
        if(currentUser) {
            window.location.href = '/#/venues';
            return;
        }
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

    // Register
    var registerCtrl = function($scope, $routeParams) {
        var currentUser = Hit.User.getCurrent();
        if(currentUser) {
            window.location.href = '/#/venues';
            return;
        }
        $scope.register = function(user) {
            $scope.failed = null;
            if($scope.registerForm.$valid) {
                Hit.User.signUp(user).done(function() {
                    window.location.href = '/#/venues';
                }).fail(function(user, error) {
                    $scope.failed = error.message || 'Registration failed. Please try again.';
                    $scope.$apply();
                });
            }
        };
    };

    // Venue searchCtrl
    var venueSearchCtrl = function($rootScope, $routeParams) {

        // login check
        if(!Hit.User.getCurrent()) {
            window.location.href = '/#/login';
        } 
        var scope = $rootScope;
        scope.user = Hit.User.getCurrent();
        scope.venues = [];
        scope.searching = false;
        scope.error = false;
        var timeout = null;
        scope.search = function(searchtext) {
            scope.searching = true;
            scope.error = false;
            scope.venues = [];
            scope.$apply();
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                if(!_(searchtext).isEmpty()) {
                    Hit.Venue.searchByName(searchtext).done(function(venues) {
                        scope.searching = false;
                        scope.venues = venues;
                        scope.$apply();
                    }).fail(function() {
                        scope.error = true;
                        scope.searching = false;
                        scope.$apply();
                    });
                } else {
                    scope.searching = false;
                    scope.$apply();
                }
            }, 500);
        }; 
        scope.logout = function() {
            Hit.User.logOut();
            window.location.href = '/#/login';
        };
    };

    // View Venue
    var viewVenueCtrl = function($rootScope, $routeParams) {

        // login check
        if(!Hit.User.getCurrent()) {
            window.location.href = '/#/login';
        }
        var scope = $rootScope;
        scope.user = Hit.User.getCurrent();
        var venueid = $routeParams.venueid;
        scope.error = null;
        Hit.Venue.getById(venueid).done(function(venue) {
            scope.venue = venue;
            scope.$apply();
        }).fail(function(venue, error) {
            scope.error = error.message;
            scope.$apply();
        });
    };

    angular.module('hit', []).
        config(['$routeProvider', function($routeProvider) {
            $routeProvider.
            when('/login', {templateUrl: 'partials/login.html', controller: loginCtrl}).
            when('/register', {templateUrl: 'partials/register.html', controller: registerCtrl}).
            when('/venues', {templateUrl: 'partials/venues.html', controller: venueSearchCtrl}).
            when('/venues/:venueid', {templateUrl: 'partials/viewvenue.html', controller: viewVenueCtrl}).
            otherwise({redirectTo: '/login'});
    }]);

})(jQuery);