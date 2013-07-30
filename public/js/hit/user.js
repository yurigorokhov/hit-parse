(function($) {

    Hit.provide('Hit.User');

    Hit.User = function(userData) {
        this._parseUser = userData;
        this.username = userData.attributes.email;
        this.displayname = userData.attributes.displayname;
        this.email = userData.attributes.email;
        this.dob = userData.attributes.dob;
        this.gender = userData.attributes.gender;
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
        }
    });

})(jQuery);