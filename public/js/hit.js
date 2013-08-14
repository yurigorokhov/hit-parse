(function($) {

    // Login
    var loginCtrl = function($scope, $routeParams) {
        if($scope.currentUser) {
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

    // Reset password
    var resetPasswordCtrl = function($scope, $routeParams) {
        if($scope.currentUser) {
            window.location.href = '/#/venues';
            return;
        }
        $scope.failed = null;
        $scope.success = false;
        $scope.resetPassword = function(user) {
            $scope.failed = null;
            $scope.success = false;
            Hit.User.requestPasswordReset(user.email).done(function() {
                $scope.success = true;
                $scope.$apply();
            }).fail(function(error) {
                $scope.failed = error;
                $scope.$apply();
            });
        };
    };

    // Register
    var registerCtrl = function($scope, $routeParams) {
        if($scope.currentUser) {
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
        var scope = $rootScope;
        if(!scope.currentUser) {
            window.location.href = '/#/login';
        } 
        scope.venues = [];
        scope.searching = false;
        scope.error = false;
        var timeout = null;
        scope.search = function(searchtext) {
            scope.searching = true;
            scope.error = false;
            scope.venues = [];
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
        var scope = $rootScope;
        if(!scope.currentUser) {
            window.location.href = '/#/login';
        }
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

    var venueCreateCtrl = function($rootScope, $routeParams) {

        // login check
        var scope = $rootScope;
        if(!scope.currentUser) {
            window.location.href = '/#/login';
        }
        var venueid = $routeParams.venueid;
        if(venueid) {
            Hit.Venue.getById(venueid).done(function(venue) {
                scope.venue = venue;
                scope.twitterPic = venue.profilepic;
                scope.$apply();
            });
        }
        scope.failed = null;
        scope.success = false;
        scope.twitterPic = 'http://a0.twimg.com/sticky/default_profile_images/default_profile_6_normal.png';
        var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        scope.create = function(venue) {
            scope.failed = null;
            scope.success = false;
            if(venueid) {
                venue.save().done(function(v) {
                    window.location.href = '/#/venues/' + v._parseVenue.id;
                }).fail(function(error) {
                    scope.failed = error || 'There was an error saving the venue.'
                    scope.$apply();
                });
            } else {
                Hit.Venue.create(venue).done(function(v) {
                    window.location.href = '/#/venues/' + v._parseVenue.id;
                }).fail(function(error) {
                    scope.failed = error || 'There was an error creating the venue.'
                    scope.$apply();
                });
            }
        };
        scope.fetchPic = function(twitterName) {
            Parse.Cloud.run('fetchTwitterPic', {twitter: twitterName}, {
                success: function(url) {
                    scope.twitterPic = url || '';
                    scope.$apply();
                }
            });
        };
        scope.updatehours = function(venue) {
            _(days).each(function(day, index) {
                if(index > 0 && (!venue.hours[day] || !venue.hours[day].from || !venue.hours[day].to)) {
                    var prev = venue.hours[days[index-1]];
                    if(prev) {
                        venue.hours[day] = venue.hours[day] || {};
                        venue.hours[day].from = venue.hours[day].from || prev.from;
                        venue.hours[day].to = venue.hours[day].to || prev.to;
                    }
                }
            });
        };
    }

    var wrap = function(ctrl) {
        return function($scope, $routeParams) {
            $scope.currentUser = Hit.User.getCurrent();
            $scope.isAdmin = false;
            $scope.currentUser.isAdmin().done(function(isAdmin) {
                $scope.isAdmin = isAdmin;
                $scope.$apply();
            });
            ctrl($scope, $routeParams);
        };
    };

    var app = angular.module('hit', ['$strap.directives']).
        config(['$routeProvider', function($routeProvider) {
            $routeProvider.
            when('/login', {templateUrl: 'partials/login.html', controller: wrap(loginCtrl)}).
            when('/register', {templateUrl: 'partials/register.html', controller: wrap(registerCtrl)}).
            when('/resetpassword', {templateUrl: 'partials/resetpassword.html', controller: wrap(resetPasswordCtrl)}).
            when('/venues', {templateUrl: 'partials/venues.html', controller: wrap(venueSearchCtrl)}).
            when('/venues/create', {templateUrl: 'partials/createvenue.html', controller: wrap(venueCreateCtrl)}).
            when('/venues/:venueid', {templateUrl: 'partials/viewvenue.html', controller: wrap(viewVenueCtrl)}).
            when('/venues/:venueid/edit', {templateUrl: 'partials/createvenue.html', controller: wrap(venueCreateCtrl)}).
            otherwise({redirectTo: '/login'});
    }]);
    app.value('$strapConfig', {
        datepicker: {
            startView: 2
        }
    });
    app.directive('ngBlur', ['$parse', function($parse) {
        return function(scope, element, attr) {
            var fn = $parse(attr['ngBlur']);
            element.bind('blur', function(event) {
                scope.$apply(function() {
                    fn(scope, {$event:event});
                });
            });
        }
    }]);

})(jQuery);