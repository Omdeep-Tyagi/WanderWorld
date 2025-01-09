const User = require("../models/user.js");

module.exports.signup = async (req, res,next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    // console.log(registeredUser);
    req.login(registeredUser, (err) => {//req.login() is a method provided by passport//with this user will be logged in after signup itself , user doesn't need to login after signup
      if (err) {
        return next(err);
      }
      req.flash("success", "User was registered");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.rendersignupform = (req, res) => {
  res.render("user/signup.ejs");
};

module.exports.renderloginform = (req, res) => {
  res.render("user/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderWorld!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
  // res.redirect("/listings");
};

module.exports.logout = (req, res,next) => {
  req.logout((err) => {// logout() is a method provided by passport
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
