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
    }
};