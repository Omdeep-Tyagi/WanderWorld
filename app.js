if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const wrapAsync = require("./utils/wrapAsync.js");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); //To parse data inside request
app.use(methodOverride("_method")); 
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

const dbUrl= process.env.ATLASDB_URL;

//the default server side session store is memory store which is not good for production
//so we are using connect-mongo to store session related data
// it will be saved as a new collection by the name of sessions in the database
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    sceret: process.env.SECRET_CODE,
  },
  touchAfter: 24 * 3600,//this will keep the session alive for 24 hours if there is no change in session
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET_CODE,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());// its work is to store user id in session which can be used to get user details
passport.deserializeUser(User.deserializeUser());

// calling main function
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });



async function main() {
  await mongoose.connect(dbUrl);
}

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; //req.user will have undefined if no user is logged in else it will have user details // this is provided by passport
  next();
});

// //To test the user model
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"student", 
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");//this is passport local mongoose method
//   res.send(registeredUser);
// });


app.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

app.get(
  "/listings/filter/:category",
  wrapAsync(async (req, res) => {
    const { category } = req.params;
    const allListings = await Listing.find({ category: category });
    // console.log(allListings);
    if (!allListings) {
      req.flash("error", "For this category ,there is no listing!");
      res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
  })
);

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


// handle route which does not exist from above defined routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});


// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  //res.status(statusCode).send(message);
});


// //To test the listing model
// app.get("/testListing",async(req,res)=>{
//   let sampleListing = new Listing({
//     title: "Taj Mahal",
//     description: "The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in the Indian city of Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal; it also houses the tomb of Shah Jahan himself.",
//     price: 100,
//     location: "Agra",
//     country: "India",
//     category: "Iconic Cities",
//   });

//   await sampleListing.save();
//   res.send("Successful testing");
// });


app.listen(process.env.PORT, () => {
  console.log(`Server is listening to port ${process.env.PORT}`);
});
