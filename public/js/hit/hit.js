Hit = { };

Hit.provide = function(namespaceString) {
    var currentNode = Hit;
    var parts = namespaceString.split('.');
    for(var i = 1, length = parts.length; i < length; i++) {
        currentNode[parts[i]] = currentNode[parts[i]] || {};
        currentNode = currentNode[parts[i]];
    }
};

// Parse Init
Hit.appId = 'Gjy5f0o2limWmCwEZXBwYi3EUULEVfZWZo6OZ2GQ';
Hit.jsApiKey = 'eZ3hgT3pUwU9N31UVyqKsRDYAFRJJEQYUWKztnoq';
Hit.restApiKey = 'Q74Rl1y2ufejKANALdMt7TSKzCiEBoKoqyp9ClRT';
Parse.initialize(Hit.appId, Hit.jsApiKey);

// Underscore & underscore.string
(function(_contains, _include) {
    _.mixin(_.str.exports());
    _.mixin({
        reverse: function(obj) {
            if (typeof obj === "string") {
                return _.str.reverse(obj);
            }
            return obj.reverse();
        },
        contains: function(obj, value) {
            if (typeof obj === "string") {
                return _.str.contains(obj, value);
            }
            return _contains.apply(this, arguments);
        },
        include: function(obj, value) {
            if (typeof obj === "string") {
                return _.str.include(obj, value);
            }
            return _include.apply(this, arguments);
        }
    });
})(_.contains, _.include);