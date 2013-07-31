(function($) {

    Hit.provide('Hit.Venue');

    Hit.Venue = function(data) {
        this._parseVenue = data;
        this.name = data.attributes.name;
        this.location = {
            latitude: data.attributes.location._latitude,
            longitude: data.attributes.location._longitude
        };
        this.address = data.attributes.address;
        this.phone = data.attributes.phone;
        this.hours = data.attributes.hours;
    };

    _(Hit.Venue).extend({

        _Venue: Parse.Object.extend('Venue'),
        _Picture: Parse.Object.extend('Picture'),

        create: function(data) {
            var def = $.Deferred();
            var v = new this._Venue();
            v.set("name", data.name);
            v.set("address", data.address);
            v.set("phone", data.phone);
            v.set("hours", data.hours);
            var point = new Parse.GeoPoint(data.location);
            v.set("location", point);
            v.save(null, {
                success: function(venue) {
                    def.resolve(new Hit.Venue(venue));
                },
                error: function(venue, error) {
                    def.reject(error.message);
                }
            });
            return def.promise();
        },

        getById: function(id) {
            var def = $.Deferred();
            var q = new Parse.Query(this._Venue);
            q.get(id, {
                success: function(venue) {
                    def.resolve(new Hit.Venue(venue));
                },
                error: function(venue, error) {
                    def.reject(venue, error);
                }
            })
            return def.promise();
        },

        searchByNameAndLocation: function(name, location) {
            var def = $.Deferred();
            var q = new Parse.Query(this._Venue);
            var point = new Parse.GeoPoint(location);
            q.matches('name', name, 'i').withinMiles('location', point, 10).limit(15)
            .find({
                success: function(venues) {
                    def.resolve(_(venues).map(function(v) { return new Hit.Venue(v); }));
                },
                error: function(error) {
                    def.reject(error);
                }
            });
            return def.promise();
        },

        searchByName: function(name) {
            var def = $.Deferred();
            var q = new Parse.Query(this._Venue);
            q.matches('name', name, 'i').limit(15).find({
                success: function(venues) {
                    def.resolve(_(venues).map(function(v) { return new Hit.Venue(v); }));
                },
                error: function(error) {
                    def.reject(error);
                }
            });
            return def.promise();
        },

        getPicturesById: function(id) {
            var def = $.Deferred();
            var q = new Parse.Query(this._Picture);
            var v = new this._Venue();
            v.id = id;
            q.equalTo("venue", v);
            q.descending('createdAt');
            q.find({
                success: function(pictures) {
                    def.resolve(pictures);
                },
                error: function(error) {
                    def.reject(error);
                } 
            });
            return def.promise();
        },

        getFirstPictureById: function(id) {
            var def = $.Deferred();
            var q = new Parse.Query(this._Picture);
            var v = new this._Venue();
            v.id = id;
            q.equalTo("venue", v);
            q.descending('createdAt');
            q.first({
                success: function(picture) {
                    def.resolve(picture);
                },
                error: function(error) {
                    def.reject(error);
                } 
            });
            return def.promise();
        }

    });

    _(Hit.Venue.prototype).extend({

        addPictures: function(files) {
            var self = this;
            var def = $.Deferred();
            _(files).each(function(file) {
                if(!_(file.type).startsWith('image')) {
                    throw file.name + ' is not an image.';
                }
            });

            var defs = _(files).map(function(file) {
                var innerDef = $.Deferred();
                var filename = Math.uuid(32);
                var xhr = new XMLHttpRequest();
                if (xhr.upload) {
                    xhr.open('POST', 'https://api.parse.com/1/files/' + filename, true);
                    xhr.setRequestHeader("X-Parse-Application-Id", Hit.appId);
                    xhr.setRequestHeader("X-Parse-REST-API-Key", Hit.restApiKey);
                    xhr.setRequestHeader("Content-Type", file.type);
                    xhr.send(file);
                }
                xhr.onreadystatechange = function(e) {
                    if(xhr && xhr.readyState == 4) {
                        if(xhr.status >= 200 && xhr.status < 300) {
                            innerDef.resolve(JSON.parse(xhr.responseText));
                        } else {
                            innerDef.reject(e);
                        }
                    }
                }
                return innerDef.promise();
            });
            var pictures;
            $.when.apply($, defs).then(function() {
                var pictures = _(arguments).chain().map(function(res) {
                    return res || null;
                }).reject(function(val) { return val === null }).value();
                _(pictures).each(function(pic) {
                    var p = new Hit.Venue._Picture();
                    p.set('name', pic.name);
                    p.set('url', pic.url);
                    p.set('venue', self._parseVenue);
                    p.save(null, {});
                });
                def.resolve();
            });
            return def.promise();
        }
    });

})(jQuery);