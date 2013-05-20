
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

var _ = require('cloud/underscore-min.js');

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
    allowedFields = ['name', 'location', 'address', 'phone', 'hours'];
    _(request.object.attributes).each(function(val, key) {
        if(!_(allowedFields).contains(key)) {
            request.object.unset(key);
        }
    });

    // Add created by
    if(!request.user) {
        response.error('You are not logged in!');
    }
    request.object.set('createdby', request.user);

    // Set permissions
    var acl = new Parse.ACL(request.user);
    acl.setPublicWriteAccess(false);
    request.object.setACL(acl);
    response.success();
});