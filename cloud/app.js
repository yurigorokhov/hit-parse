
var express = require('express');
var util = require('cloud/util.js');
var app = express();

app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(express.bodyParser());

var wrap = function(callback) {
    return function(req, res) {
        if(Parse.User.current() === null) {
            res.send(401, 'You must be logged in');
        } else {
            callback(req, res);
        }
    };
};

app.listen();
