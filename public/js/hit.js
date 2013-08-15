(function($) {

    // Login
    var loginCtrl = function($scope, $location, $routeParams, user) {
        initGlobalScope($scope, user);
        if($scope.currentUser) {
            $location.path('/venues');
        }
        $scope.failed = false;
        $scope.login = function(user) {
            $scope.failed = false;
            if($scope.loginForm.$valid) {
                Hit.User.logIn(user.email, user.password).done(function() {
                    $location.path('/venues');
                }).fail(function() {
                    $scope.failed = true;
                    $scope.$apply();
                });
            }
        };
    };

    // Reset password
    var resetPasswordCtrl = function($scope, $location, $routeParams, user) {
        initGlobalScope($scope, user);
        if($scope.currentUser) {
            $location.path('/venues');
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
    var registerCtrl = function($scope, $location, $routeParams, user) {
        initGlobalScope(scope, user);
        if($scope.currentUser) {
            $location.path('/venues');
        }
        $scope.register = function(user) {
            $scope.failed = null;
            if($scope.registerForm.$valid) {
                Hit.User.signUp(user).done(function() {
                    $location.path('/venues');
                }).fail(function(user, error) {
                    $scope.failed = error.message || 'Registration failed. Please try again.';
                    $scope.$apply();
                });
            }
        };
    };

    // Venue searchCtrl
    var venueSearchCtrl = function($rootScope, $location, $routeParams, user) {

        // login check
        var scope = $rootScope;
        initGlobalScope(scope, user);
        if(!scope.currentUser) {
            $location.path('/login');
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
            $location.path('/login');
        };
    };

    // View Venue
    var viewVenueCtrl = function($rootScope, $location, $routeParams, user) {

        // login check
        var scope = $rootScope;
        initGlobalScope(scope, user);
        if(!scope.currentUser) {
            $location.path('/login');
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

    var venueCreateCtrl = function($rootScope, $location, $routeParams, user) {

        // login check
        var scope = $rootScope;
        initGlobalScope(scope, user);
        if(!scope.currentUser) {
            $location.path('/login');
        }
        var venueid = $routeParams.venueid;
        if(venueid) {
            Hit.Venue.getById(venueid).done(function(venue) {
                scope.$apply(function() {
                    scope.venue = venue;
                    scope.twitterPic = venue.profilepic;
                });
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
                    $location.path('/venues/' + v._parseVenue.id);
                }).fail(function(error) {
                    scope.$apply(function() {
                        scope.failed = error || 'There was an error saving the venue.';
                    });
                });
            } else {
                Hit.Venue.create(venue).done(function(v) {
                    $location.path('/venues/' + v._parseVenue.id);
                }).fail(function(error) {
                    scope.$apply(function() {
                        scope.failed = error || 'There was an error creating the venue.';
                    });
                });
            }
        };
        scope.fetchPic = function(twitterName) {
            Parse.Cloud.run('fetchTwitterPic', {twitter: twitterName}, {
                success: function(url) {
                    scope.$apply(function() {
                        scope.twitterPic = url || '';
                    });
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

    var initGlobalScope = function(scope, user) {
        if(!scope.hasOwnProperty('currentUser')) {
            scope.currentUser = user.current();
        }
        if(!scope.hasOwnProperty('isAdmin')) {
            scope.isAdmin = false;
            user.isAdmin().done(function(result) {
                scope.isAdmin = result;
            });
        }
    };

    var app = angular.module('hit', ['$strap.directives']).
        config(['$routeProvider', function($routeProvider) {
            $routeProvider.
            when('/login', {templateUrl: 'partials/login.html', controller: loginCtrl}).
            when('/register', {templateUrl: 'partials/register.html', controller: registerCtrl}).
            when('/resetpassword', {templateUrl: 'partials/resetpassword.html', controller: resetPasswordCtrl}).
            when('/venues', {templateUrl: 'partials/venues.html', controller: venueSearchCtrl}).
            when('/venues/create', {templateUrl: 'partials/createvenue.html', controller: venueCreateCtrl}).
            when('/venues/:venueid', {templateUrl: 'partials/viewvenue.html', controller: viewVenueCtrl}).
            when('/venues/:venueid/edit', {templateUrl: 'partials/createvenue.html', controller: venueCreateCtrl}).
            otherwise({redirectTo: '/login'});
    }]).factory('user', function() {
        return {
            current: function() {
                return Hit.User.getCurrent();
            },
            isAdmin: function() {
                var u = Hit.User.getCurrent();
                if(u) {
                    return u.isAdmin();
                } else {
                    var def = new $.Deferred();
                    def.resolve(false);
                    return def.promise();
                }
            }
        };
    }).value('$strapConfig', {
        datepicker: {
            startView: 2
        }
    }).directive('ngBlur', ['$parse', function($parse) {
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