const express        = require('express'),
	  app            = express(),
      bodyParser     = require('body-parser'),
	  flash          = require('connect-flash'),
	  passport       = require('passport'),
	  localStrategy  = require('passport-local'),
	  localMongoose  = require('passport-local-mongoose'),
	  methodOverride = require('method-override'),
      mongoose       = require('mongoose'),
	  Campground     = require('./models/campground'),
	  Comment        = require('./models/comment'),
	  User		     = require('./models/user'),
	  seedDB	     = require('./seeds');
const PORT = process.env.PORT || 5000;

var commentRoutes    = require('./routes/comments'),
	campgroundRoutes = require('./routes/campgrounds'),
	authRoutes       = require('./routes/auth');


mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true });
app.use(express.static("public"));
app.locals.moment = require('moment');
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set('view engine', 'ejs');

// seedDB();

//PASSPORT CONFIGURATION
app.use(require('express-session')({
	secret: "The quick brown fox jumps over the lazy dog",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use(authRoutes);
app.use(commentRoutes);
app.use("/campgrounds",campgroundRoutes);




app.listen(PORT, () => console.log(`Listening on ${ PORT }`));