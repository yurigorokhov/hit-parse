
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

var _ = require('underscore');
var util = require('cloud/util.js');
var Mailgun = require('mailgun');
Mailgun.initialize('hit.mailgun.org', 'key-2p7zg4ed2q-bm43vtg8fnrbkl-uuxjn3');

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
    var mandatoryFields = ['name', 'address', 'phone', 'hours', 'address'];
    var allowedFields = _(mandatoryFields).union(['pictures']);
    _(request.object.attributes).each(function(val, key) {
        if(!_(allowedFields).contains(key)) {
            request.object.unset(key);
        }
    });

    // Verify Fields
    util.verifyFields(mandatoryFields, request.object, function(result) {
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
        var location = request.object.get('location');

        // Fetch GPS location
        //TODO: makes it impossible to change location
        if(address && !location) {
            util.getGpsLocationFromAddress(address, function(res) {
                if(res.success) {        
                    var acl = new Parse.ACL(request.user);
                    acl.setPublicWriteAccess(false);
                    acl.setPublicReadAccess(true);
                    request.object.set('location', res.location);   
                    request.object.setACL(acl);
                    request.object.set('createdby', request.user);
                    response.success();
                    return;
                } else {
                    response.error(res.message);
                    return;
                }
            });
        }
    });
});
