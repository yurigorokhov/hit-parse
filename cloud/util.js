var _ = require('cloud/underscore-min.js');

module.exports = {
    
    verifyFields: function(fields, object, callback) {
        var missingField = _(fields).find(function(field) {
            return !object.get(field);
        });
        if(missingField) {
            callback({
                    success: false,
                    message: 'Field ' + missingField + ' is missing!'
                });
        } else {
            callback({ success:true });
        }
    },

    getGpsLocationFromAddress: function(address, callback) {
        Parse.Cloud.httpRequest({
            url: 'http://maps.googleapis.com/maps/api/geocode/json',
            params: {
                address: address.address + '+' + address.city + '+' + address.state + '+' + address.zip,
                sensor: 'true'
            },
            success: function(locationResult) {
                var res = JSON.parse(locationResult.text);
                var locationResult = _(res.results).first().geometry.location;
                callback({
                    success: true,
                    location: new Parse.GeoPoint({ longitude: locationResult.lng, latitude: locationResult.lat })
                });
            },
            error: function(error) {
                callback({
                    success: false,
                    message: 'Failed to fetch location for address: ' + error.status

                });
            }
        });
    }
};