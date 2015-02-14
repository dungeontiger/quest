var express = require('express');
var router = express.Router();

// show the landing page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quest' });
});

// show the signup page
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign Up for Quest' });
});

// show the login page
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Log Into Quest' });
});

// show the reset password page
router.get('/resetPassword', function(req, res, next) {
  res.render('resetPassword', { title: 'Reset Quest Password' });
});

// add a user
router.post('/doSignup', function(req, res, next) {

	// TODO: input validation

	var db = req.db;
	var userName = req.body.userName;
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;
	var password = req.body.password;

	var users = db.get('users');

	users.insert({
		"userName": userName,
		"email": email,
		"firstName" : firstName,
		"lastName" : lastName,
		"password" : password
	}, function(err, doc) {
		// after insert has completed do this
		if (err) {
			res.send("Could not add user to database");
		} else {
			res.location('/');
			res.redirect('/');
		}
	})
});

module.exports = router;
