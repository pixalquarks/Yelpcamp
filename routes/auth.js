var express  = require('express');
var router   = express.Router();
var passport = require('passport');
var User     = require('../models/user');
var middleware = require('../middleware');

//HOME ROUTE
router.get("/", (req, res) => {
	res.render("campgrounds/home");
});





//AUTH ROUTE
router.get('/register', (req, res) => {
	res.render('register', {page: 'register'});
});

router.post('/register', (req, res) => {
	User.register(new User({ username: req.body.username}), req.body.password, function(err, user){
		if(err){
			req.flash('error', `Oops! ${err.message}`);
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function(){
			req.flash('success', 'Successfully Registered. YAY!');
			res.redirect('/campgrounds');
		});
	});
});

//LOGIN ROUTE
router.get('/login', (req, res) => {
	res.render('login', {page: 'login'});
});

router.post('/login',passport.authenticate('local', {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}), (req, res) => {
	
});
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'Logged you out');
	res.redirect("/campgrounds");
});


module.exports = router;