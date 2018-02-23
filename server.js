var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');
var app = express();
var Schema = mongoose.Schema;

app.use(bodyParser.json());
app.use(session({secret: 'drowssap'}));
app.use(express.static(path.join(__dirname, './loginSample', '/dist')));
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/loginSample');

var usersSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    email: {type: String, required: true, minlength: 8, unique: true},
    password: {type: String, required: true, minlength: 8}
}, {timestamps: true});

mongoose.model('Users', usersSchema);
var User = mongoose.model('Users');

app.post('/api/users', function(req, res){

    User.findOne({email: req.body.email}, function(err, foundUser) {
        if (err) {
            console.log('error in top post', err);
            res.json({message: "Error", errors: err});
        } else if (foundUser == null) {
            let newUser = new User(req.body);
            newUser.save(function(err, user) {
                if (err) {
                    console.log('error in post', err);
                    res.json({message: "Error", errors: err});
                } else {
                    req.session.userId = user._id;
                    res.json({message: "Successfully created a new user", data: user});
                }
            })
        } else {
            if (foundUser.password == req.body.password) {
                req.session.userId = foundUser._id;
                res.json({message: "Found user!", data: foundUser});
            } else {
                res.json({message: "Incorrect login info"});
            }
        }
    })
})

app.all('*', (req, res, next)=> {
    res.sendFile(path.resolve('./loginSample/dist/index.html'));
})

app.listen(8000, function() {
    console.log('listening on port 8000');
})