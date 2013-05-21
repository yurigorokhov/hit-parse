
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

var _ = require('cloud/underscore-min.js');
var util = require('cloud/util.js');

//--- User ---
Parse.Cloud.beforeSave(Parse.User, function(request, response) {
    allowedFields = ['username', 'displayname', 'password', 'email', 'dob', 'gender'];
    _(request.object.attributes).each(function(val, key) {
        if(!_(allowedFields).contains(key)) {
            request.object.unset(key);
        }
    });
    response.success();
});


//--- Venue ---
Parse.Cloud.beforeSave('Venue', function(request, response) {
    allowedFields = ['name', 'address', 'phone', 'hours', 'address'];
    _(request.object.attributes).each(function(val, key) {
        if(!_(allowedFields).contains(key)) {
            request.object.unset(key);
        }
    });

    // Verify Fields
    util.verifyFields(allowedFields, request.object, function(result) {

        if(!result.success) {
            response.error(result.message);
            return;
        }

        // Add created by
        if(!request.user) {
            response.error('You are not logged in!');
            return;
        }
        var address = request.object.get('address');

        // Fetch GPS location
        Parse.Cloud.httpRequest({
            url: 'http://maps.googleapis.com/maps/api/geocode/json',
            params: {
                address: address.address + '+' + address.city + '+' + address.state + '+' + address.zip,
                sensor: 'true'
            },
            success: function(locationResult) {
                var res = JSON.parse(locationResult.text);
                var location = _(res.results).first().geometry.location;
                request.object.set('location', new Parse.GeoPoint({ longitude: location.lng, latitude: location.lat }));
                request.object.set('createdby', request.user);

                // Set permissions
                var acl = new Parse.ACL(request.user);
                acl.setPublicWriteAccess(false);
                request.object.setACL(acl);
                response.success();
            },
            error: function(error) {
                response.error('Failed to fetch location for address: ' + error.status);
            }
        })
    });
});