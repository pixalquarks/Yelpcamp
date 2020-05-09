var express = require('express');
var router  = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');

//INDEX ROUTE
router.get("/", (req, res) => {
	if(req.query.search){
		 const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name : regex}, function(err, campgrounds){
		if(campgrounds.length == 0){
			req.flash("error", "No item matches your query, please try again.");
			return res.redirect('/campgrounds');
		}
		if(err){
			req.flash('error', 'Couldn\'t process your request. Please try again. ');
		}	
		else{
			res.render("campgrounds/campgrounds", {campgrounds: campgrounds, currentUser: req.user, page: 'campgrounds'});
		}
	});
	} else{
		Campground.find({}, function(err, campgrounds){
		if(err){
			req.flash('error', 'Couldn\'t process your request. Please try again. ')
		} else{
			res.render("campgrounds/campgrounds", {campgrounds: campgrounds, currentUser: req.user, page: 'campgrounds'});
		}
	});
	}
	
	
});

//NEW ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

//CREATE ROUTE
router.post("/", middleware.isLoggedIn, (req, res) => {
	var name		  = req.body.name;
	var url 		  = req.body.imgurl;
	var price 		  = req.body.price;
	var description   = req.body.description;
	var author        = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, image: url, price: price, description: description, author: author};
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			req.flash('error', 'Something went wrong');
		} else{
			req.flash('success', 'Campground successfully created');
			res.redirect('/campgrounds');
		}
	});	
});

//SHOW ROUTE
router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate('comments').exec(function(err, found){
		if(err){
			req.flash('error', 'Could not get your request.');
		} else{
			if(!found){
				console.log(found);
				return res.status(400).send('Item not found');
			}
		    res.render("campgrounds/show", {campground: found});	
		}
	});
	
});
//EDIT ROUTE
router.get("/:id/edit",middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, function(err, found){
		if(!found){
				return res.status(400).send('Item not found');
			}
		res.render('campgrounds/edit', {campground: found});
	});
});

//UPDATE ROUTE
router.put("/:id",middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, update){
		if(err){
			req.flash('error', 'Oops! Something went wrong.')
			res.redirect('/campgrounds');
		} else {
			if(!update){
				return res.status(400).send('Item not found');
			}
			req.flash('success', 'Campground successfully updated')
			res.redirect('/campgrounds/' + req.params.id);
		}
	})
})
//DESTROY ROUTE
router.delete('/:id',middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, function(err, removed){
		if(err){
			req.flash('error', 'Cannot process your request, try again.')
			res.redirect("/campgrounds/" + req.params.id);
		} else {
			if(!removed){
				return res.status(400).send('Item not found');
			}
			req.flash('success', 'Successfully deleted the campground');
			res.redirect("/campgrounds");
		}
	})
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;