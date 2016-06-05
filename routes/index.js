var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var register = require('../passport/register');
var bCrypt = require('bcrypt-nodejs');
var Forget = require('../passport/forget');



var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
};

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		if (req.user)
			res.redirect('home', { message: req.flash('message') }, {user: req.user});
		else
			res.render('foodopiaMainPage', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true
	}));

	/* GET results page. */
	router.get('/results', function(req, res) {
		// Display the Login page with any flash message, if any
		res.render('searchResults', { message: req.flash('message') });
	});

	/* Handle results POST */
	router.post('/results', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true
	}));

	/* GET recipe page. */
				 //individualRecipes
	router.get('/individualRecipes', function(req, res) {
		// Display the Login page with any flash message, if any

		res.render('individualRecipes', { message: req.flash('message') });
	});

	/* Handle recipe POST */
				  //individualRecipes
	router.post('/individualRecipes', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	router.get('/storage', isAuthenticated, function(req, res){
		console.log('');
		res.render('VirtualFridge',{user: req.user});
		res.render('VirtualFridge',{message: req.flash('message')});
	});

	router.get('/recipes', function(req, res){
		res.render('myRecipes',{message: req.flash('message')});
	});

	router.get('/create', isAuthenticated, function(req, res){
		res.render('createRecipe',{user: req.user});
		res.render('createRecipe',{message: req.flash('message')});
	});

	router.get('/searchResults', function(req, res){
		res.render('searchResults',{message: req.flash('message')});
	});

	router.get('/customSearch', function(req, res){
		res.render('privateCook',{user: req.user});
		res.render('privateCook',{message: req.flash('message')});
	});

	router.get('/profile', isAuthenticated, function(req, res){
		res.render('profilePage',{user: req.user});
		res.render('profilePage', {message: req.flash('message')});
	});

	/* GET recipe page. */
	router.get('/individualRecipes', function(req, res) {
		// Display the Login page with any flash message, if any
		res.render('individualRecipes', { message: req.flash('message') });
	});


	//handle forget password
	router.post('/forgot', function(req, res, next) {
		Forget.sendResetEmail(req, res, next);
	});

	router.get('/reset/:token', function(req, res) {
		User.findOne({ $and: [{resetPasswordToken: req.params.token}, {resetPasswordExpire: { $gt: Date.now()} }] }, function(err, user) {
			if (!user) {
				req.flash('error', 'Password reset token is invalid or has expired.');
				console.log(err);
				console.log('user: '+user);
				console.log(req.params.token);
				return res.redirect('/');
			}
			res.render('reset', {message: req.flash('message')
			});
		});
	});

	router.post('/reset/:token', function(req, res) {
		Forget.resetPost(req, res);
	});
//=======
	router.get('/individual', function(req, res){
		res.render('individualRecipes', {message: req.flash('message')});
	    //origin/copy_master
	});

	router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// handle the callback after facebook has authenticated the user
	router.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/home',
			failureRedirect : '/'
		})
	);

	return router;
};
