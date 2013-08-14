(function($) {

    Hit.provide('Hit.User');

    Hit.User = function(userData) {
        this._parseUser = userData;
        this.username = userData.attributes.email;
        this.displayname = userData.attributes.displayname;
        this.email = userData.attributes.email;
        this.dob = userData.attributes.dob;
        this.gender = userData.attributes.gender;
        this._isAdmin = null;
    }

    _(Hit.User).extend({
        signUp: function(userData) {
            var def = $.Deferred();
            var user = new Parse.User();
            user.set('username', userData.email);
            user.set('displayname', userData.displayname);
            user.set('password', userData.password);
            user.set('email', userData.email);
            user.set('dob', userData.dob);
            user.set('gender', userData.gender);
            user.signUp(null, {
                success: function(user) {
                    def.resolve(new Hit.User(user));
                },
                error: function(user, error) {
                    def.reject(user, error);
                }
            });
            return def.promise();
        },

        logIn: function(username, password) {
            var def = $.Deferred();
            Parse.User.logIn(username, password, {
                success: function(user) {
                    var u = new Hit.User(user);
                    def.resolve(u);
                },
                error: function(user, error) {
                    def.reject(user, error);
                }
            });
            return def.promise();
        },

        logOut: function() {
            Parse.User.logOut();
        },

        getCurrent: function() {
            var u = Parse.User.current();
            return u ? new Hit.User(u) : null;
        },

        requestPasswordReset: function(email) {
            var def = $.Deferred();
            Parse.User.requestPasswordReset(email, {
                success: function() {
                    def.resolve();
                },
                error: function(error) {
                    def.reject(error.message);
                }
            });
            return def.promise();
        }
    });

    _(Hit.User.prototype).extend({

        update: function(userData) {
            var self = this;
            var def = $.Deferred();
            _(userData).each(function(val, key) {
                self._parseUser.set(key, val);
            });
            self._parseUser.save(null, {
                success: function(user) {
                    var u = new Hit.User(user);
                    def.resolve(u);
                },
                error: function(user, error) {
                    def.resolve(user, error);
                }
            })
            return def.promise();
        },

        isAdmin: function() {
            var def = $.Deferred();
            var self = this;
            if(self._isAdmin !== null) {
                def.resolve(self._isAdmin);
            } else {
                var queryRole = new Parse.Query(Parse.Role);
                queryRole.equalTo('name', 'Admin');
                queryRole.first({
                    success: function(result) { // Role Object
                        var role = result;
                        var adminRelation = new Parse.Relation(role, 'users');
                        var queryAdmins = adminRelation.query();
                        queryAdmins.equalTo('objectId', Parse.User.current().id);
                        queryAdmins.first({
                            success: function(result) {
                                if(result) {
                                    self._isAdmin = true;
                                    def.resolve(true);
                                } else {
                                    self._isAdmin = false;
                                    def.resolve(false);
                                }
                            },
                            error: function(error) {
                                def.reject(error);
                            }
                        });
                    },
                    error: function(error) {
                        def.reject(error);
                    }
                });
            }
            return def.promise();
        }
    });

})(jQuery);