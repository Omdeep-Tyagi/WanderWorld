const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isloggedIn, isOwner, validationListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });// this will store the image in cloudinary with multer help

const listingController = require("../controllers/listings.js");

router.get("/search", wrapAsync(listingController.search));

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isloggedIn,
    upload.single("listing[image]"),
    validationListing,
    wrapAsync(listingController.createListing)
  );

// New Route: needs to write above the show route otherwise new will be considered as an id
router.get("/new", isloggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showlisting))
  .put(
    isloggedIn,
    isOwner,
    upload.single("listing[image]"),//multer will parse the image and store it in cloudinary
    validationListing,
    wrapAsync(listingController.updatelisting)
  )
  .delete(isloggedIn, isOwner, wrapAsync(listingController.deletelisting));

// Edit route
router.get("/:id/edit", isloggedIn, wrapAsync(listingController.editform));

module.exports = router;
