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

    // Venue searchCtrl
    var venueSearchCtrl = function($rootScope, $routeParams) {

        // login check
        if(!Hit.User.getCurrent()) {
            window.location.href = '/#/login';
        }

        var scope = $rootScope;
        scope.venues = [];
        scope.searching = false;
        scope.error = false;
        var timeout = null;
        scope.search = function(searchtext) {
            scope.searching = true;
            scope.error = false;
            scope.$apply();
            clearTimeout(timeout);
            timeout = setTimeout(function() { 
                scope.venues = [];
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
                    scope.$apply();
                }
            }, 500);
        }; 
        scope.logout = function() {
            Hit.User.logOut();
            window.location.href = '/#/login';
        };
    };

    var viewVenueCtrl = function($rootScope, $routeParams) {

        // login check
        if(!Hit.User.getCurrent()) {
            window.location.href = '/#/login';
        }

        var scope = $rootScope;
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
            when('/venues', {templateUrl: 'partials/venues.html', controller: venueSearchCtrl}).
            when('/venues/:venueid', {templateUrl: 'partials/viewvenue.html', controller: viewVenueCtrl}).
            otherwise({redirectTo: '/login'});
    }]);

})(jQuery);