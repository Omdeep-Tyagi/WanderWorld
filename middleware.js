const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./Schema.js");

// Check if user is logged in
module.exports.isloggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {// isAuthenticated() is a method provided by passport
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
};

// Save redirect URL in session
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Check if user is the owner of the listing ( will use it before update, delete : server side) 
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing.owner || !listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// Server-side validation for Listing
module.exports.validationListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Server-side validation for Review
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
  
    // Check if the current user is the author of the review
    if (!review.author || !review.author._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You did not the author of this review");
      return res.redirect(`/listings/${id}`);
    }
  
    next();
  };