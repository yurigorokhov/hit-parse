var _ = require('underscore');

module.exports = {
    
    verifyFields: function(fields, object) {
        var missingField = _(fields).find(function(field) {
            return !object.get(field);
        });
        if(missingField) {
            return {
                success: false,
                message: 'Field ' + missingField + ' is missing!'
            };
        }
        return { success: true };
    },

    getGpsLocationFromAddress: function(address) {
        var promise = new Parse.Promise;
        Parse.Cloud.httpRequest({
            url: 'http://maps.googleapis.com/maps/api/geocode/json',
            params: {
                address: address.address + '+' + address.city + '+' + address.state + '+' + address.zip,
                sensor: 'true'
            },
            success: function(locationResult) {
                var res = JSON.parse(locationResult.text);
                if(res.results.length == 0) {
                    promise.reject({
                        success: false,
                        message: 'Failed to find GPS location for the provided address.'
                    });
                    return promise;
                }
                var locationResult = _(res.results).first().geometry.location;
                promise.resolve({
                    success: true,
                    location: new Parse.GeoPoint({ longitude: locationResult.lng, latitude: locationResult.lat })
                });
            },
            error: function(error) {
                promise.reject({
                    success: false,
                    message: 'Failed to fetch location for address: ' + error.status
                });
            }
        });
        return promise;
    },

    fetchTwitterPic: function(twitterName, createParseCopy) {
        var promise = new Parse.Promise;
        if(_(twitterName).isEmpty()) {
            promise.reject({
                success: false,
                message: 'Empty twitter name provided'
            });
            return promise;
        }

        // strip '@'
        if(twitterName.indexOf('@') === 0) {
            twitterName = twitterName.substring(1);
        }


        // Check if we already have the twitter picture cached
        var query = new Parse.Query("TwitterProfilePicture");
        query.equalTo('twittername', twitterName).find().then(function(results) {
            if(results.length > 0) {
                var res = results[0];
                var file = res.get('picture');
                promise.resolve({
                    success: true,
                    url: file.url()
                });
            } else {
                Parse.Cloud.httpRequest({
                    url: 'https://twitter.com/api/users/profile_image',
                    params: {
                        screen_name: twitterName
                    },
                    error: function(res) {
                        var url = res.headers.location;
                        if(url) {
                            if(!createParseCopy) {
                                promise.resolve({
                                    success: true,
                                    url: url
                                });
                            } else {
                                Parse.Cloud.httpRequest({
                                    url: url,
                                    success: function(response) {
                                        Parse.Cloud.httpRequest({
                                            url: 'https://api.parse.com/1/files/' + twitterName,
                                            method: 'POST',
                                            headers: {
                                              'X-Parse-Application-Id': 'Gjy5f0o2limWmCwEZXBwYi3EUULEVfZWZo6OZ2GQ',
                                              'X-Parse-REST-API-Key': 'Q74Rl1y2ufejKANALdMt7TSKzCiEBoKoqyp9ClRT',
                                              'Content-Type': response.headers['content-type']
                                            },
                                            body: response.buffer,
                                            success: function(httpResponse) {
                                                var fileUrl = httpResponse.data.url;
                                                var name = httpResponse.data.name;
                                                Parse.Cloud.httpRequest({
                                                    url: 'https://api.parse.com/1/classes/TwitterProfilePicture',
                                                    method: 'POST',
                                                    headers: {
                                                      'X-Parse-Application-Id': 'Gjy5f0o2limWmCwEZXBwYi3EUULEVfZWZo6OZ2GQ',
                                                      'X-Parse-REST-API-Key': 'Q74Rl1y2ufejKANALdMt7TSKzCiEBoKoqyp9ClRT',
                                                      'Content-Type': 'application/json'
                                                    },
                                                    body: {
                                                        twittername: twitterName,
                                                        picture: {
                                                            name: name,
                                                            __type: 'File'
                                                        }
                                                    },
                                                    success: function() {
                                                        promise.resolve({
                                                            success: true,
                                                            url: fileUrl
                                                        });
                                                    },
                                                    error: function() {
                                                        promise.reject({
                                                            success: false,
                                                            message: 'Failed to save twitter picture'
                                                        });
                                                    }
                                                });
                                            },
                                            error: function(httpResponse) {
                                                promise.reject({
                                                    success: false,
                                                    message: 'Failed to post file to parse with status code: ' + httpResponse.status
                                                });
                                            }
                                        });
                                    },
                                    error: function(response) {
                                        promise.reject({
                                            success: false,
                                            message: response.message
                                        });
                                    }
                                });
                            }
                        } else {
                            promise.reject({
                                success: false,
                                message: 'No URL came back from twitter!'
                            });
                        }
                    }
                });
            }
        }, function(error) {
            promise.reject({
                success: true,
                message: 'There was an error performing the search'
            });
        });
        return promise;
    }
};