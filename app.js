var express = require('express');
var app = express();
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var validator = require('express-validator');
var session = require('express-session');

var dbConfig = require('./db');
var mongoose = require('mongoose');
// Connect to DB
//mongoose.connect(dbConfig.url);
mongoose.connect('mongodb://CSE110ELF:cse110elf@ds015879.mlab.com:15879/usertest');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(validator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"abc", resave:false, saveUninitialized:true}));

/** Angoose bootstraping */
require("angoose").init(app, {
    'module-dirs':'models',
    'mongo-opts': 'localhost:27017/test',
});

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');

app.use(expressSession({secret: 'foodopia'}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport, set strategies
var initPassport = require('./passport/init');
initPassport(passport);
//initialize passport router
var Routes = require('./routes/index')(passport);
app.use('/', Routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;