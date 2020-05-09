// ==========================
// COMMENTS ROUTE
// ==========================
var express = require('express');
var router  = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');

//CREATE ROUTE
router.get("/campgrounds/:id/comments/new",middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash('error', 'Oops couldn\'t process your request at the moment')
		} else{
			if(!campground){
				return res.status(400).send('Item not found');
			}
			res.render("comments/new", {campground: campground});
		}
	});
});

router.post("/campgrounds/:id/comments",middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash('error', 'Oops cannot find the requested campground');
		} else {
			if(!campground){
				return res.status(400).send('Item not found');
			}
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					req.flash('error', 'Sorry! Could not add your comment')
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash('success', 'Successfully added your comment');
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

//EDIT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, function(err, found){
		if(err){
			req.flash('error','Can\'t get your request at the moment');
			res.redirect('back');
		} else{
			if(!found){
				return res.status(400).send('Item not found');
			}
			res.render("comments/edit", {campground_id: req.params.id, comment: found});
		}
	});
});

//UPDATE ROUTE
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updated){
		if(err){
			req.flash('error', 'Sorry, comment was not updated.');
			res.redirect('back');
		} else{
			if(!updated){
				return res.status(400).send('Item not found');
			}
			req.flash('success','Comment updated successfully');
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

//DESTROY ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash('error', 'Oops there was some error');
		} else{
			req.flash('success', 'Comment was deleted successfully');
			res.redirect('/campgrounds/' + req.params.id);
		}
	})
});


module.exports = router;