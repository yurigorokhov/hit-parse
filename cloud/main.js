
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

require('cloud/app.js');
var _ = require('underscore');
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
    var mandatoryFields = ['name', 'address', 'phone', 'hours', 'address', 'twitter'];
    var allowedFields = _(mandatoryFields);
    _(request.object.attributes).each(function(val, key) {
        if(!_(allowedFields).contains(key)) {
            request.object.unset(key);
        }
    });

    // Verify Fields
    var verify = util.verifyFields(mandatoryFields, request.object);
    if(!verify.success) {
        response.error(verify.message);
        return;
    }

    // Add created by
    if(!request.user) {
        response.error('You are not logged in!');
        return;
    }
    var address = request.object.get('address');
    var location = request.object.get('location');
    var twitter = request.object.get('twitter');

    // Fetch GPS location
    var gpsLocation = util.getGpsLocationFromAddress(address);
    var twitterPic = util.fetchTwitterPic(twitter, true);
    Parse.Promise.when(gpsLocation, twitterPic).then(function(locationRes, pictureRes) {
        var acl = new Parse.ACL(request.user);
        acl.setPublicWriteAccess(false);
        acl.setPublicReadAccess(true);
        request.object.set('location', locationRes.location);   
        request.object.setACL(acl);
        request.object.set('createdby', request.user);
        request.object.set('profilepic', pictureRes.url);
    }, function(errors) {
        var firstError = _(errors).find(function(err) {
            return err != null;
        });
        response.error(firstError.message || 'There was an error creating the venue.');
    }).then(function() {
        response.success();
    });
});

Parse.Cloud.define('fetchTwitterPic', function(request, response) {
    util.fetchTwitterPic(request.params.twitter, false).then(function(res) {
        response.success(res.url);
    }, function(error) {
        response.error(error.message || 'There was an error fetching the profile picture');
    });
});
