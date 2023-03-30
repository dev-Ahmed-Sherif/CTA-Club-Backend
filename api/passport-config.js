const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();

// function initialize(passport, getUserByEmail) {
//   const authenticateUser = async (email, password, done) => {
//     const user = await getUserByEmail(email);
//     console.log(user);
//     console.log(user._id);
//     if (user == null) {
//       // First param of done is server error , Second is result , Third is return Message
//       return done(null, false, { message: "No User with that Email" });
//     }
//     try {
//       if (await bcrypt.compare(password, user.password)) {
//         return done(null, user);
//       } else {
//         return done(null, false, { message: "Password Incorrect!" });
//       }
//     } catch (error) {
//       // console.log(error);
//       return done(error);
//     }
//   };

//   passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

//   // Create , Delete Session for User
//   passport.serializeUser((user, done) => {
//     done(null, user._id);
//   });
//   passport.deserializeUser((id, done) => {});
// }

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/api/v1/users/google/callback",
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("hello from passport");
      console.log(accessToken);
      console.log(refreshToken);
      // console.log(email);
      console.log(profile);
      // console.log(profile.emails[0].value);
      User.findOne({ email: profile.emails[0].value }).then((currentUser) => {
        if (currentUser) {
          // console.log(currentUser);
          // console.log(currentUser._id);
          done(null, currentUser);
        } else {
          User.create(
            {
              firstname: profile.name.givenName,
              lastname: profile.name.familyName,
              email: profile.emails[0].value,
              password: "",
              number: "",
              personalphoto: "",
              dateRegister: new Date(),
            },
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                console.log(data);
                console.log(data._id);
                done(null, data);
                // done(null, null, { message: "No User with that Email" });
              }
            }
          );
        }
      });
    }
  )
);

// passport.serializeUser((user, done) => {
//   console.log(user);
//   process.nextTick(() => {
//     return done(null, user._id);
//   });
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id).then((user) => {
//     return done(null, user);
//   });
// });

// module.exports = initialize;
