const express = require("express");
const app = express();
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("../middleware/authMiddleware");
require("dotenv").config();
const pass = require("../passport-config");
const sendMail = require("../sendMail");

// Correct Photo Path

function correctPath(path) {
  let newPath = path.replace(/\\/gi, "/");
  return newPath;
}

// Define Passport
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

// const initializePassport = require("../passport-config");
// initializePassport(passport, async (emailUser) => {
//   const user = await User.findOne({ email: emailUser });
//   console.log(user);
//   return user;
// });


// Define Multer

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/person");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// Creation of Authentication Token

const maxAge = 24 * 60 * 60; // milli sec

// expiresIn receive milli sec

const createToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

// Getting All Users

router.get("/", (req, res) => {
  User.find(function (err, data) {
    if (err) {
      res.send({ message: "Error ! Please check your query and try again." });
    } else {
      res.send(data);
    }
  });
});

// Get User

router.post("/user-details", requireAuth, (req, res) => {
  console.log(req.cookies.clubToken);
  console.log(req.body);
  if (req.body._id === null) {
    jwt.verify(
      req.cookies.clubToken,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.send({ message: err.message });
        } else {
          console.log(decodedToken);
          User.findOne({ _id: decodedToken.id })
            .populate({ path: "userplaygrounds" })
            .then((result) => {
              console.log(result);
              res.send({ data: result });
            });
        }
      }
    );
  } else {
    User.findOne({ _id: req.body._id })
      .populate({ path: "userplaygrounds" })
      .then((result) => {
        console.log(result);
        res.send({ data: result });
      });
  }
});

// Register User

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.findOne({ email: req.body.email });
    if (user == null) {
      User.create(
        {
          ...req.body,
          password: hashedPassword,
          personalphoto: "",
          dateRegister: new Date(),
        },
        function (err, data) {
          if (err) {
            console.log(err);
            res.send("Not Valid", err);
          } else {
            console.log(data);
            console.log(data._id);
            const token = createToken(data._id);
            res.cookie("clubToken", token, {
              httpOnly: true,
              maxAge: maxAge * 1000,
            });
            res.send({ message: "تم انشاء حساب بنجاح يرجى تسجيل الدخول" });
          }
        }
      );
    } else {
      res.send({ message: "لديك حساب بالفعل يرجى تسجيل الدخول" });
    }
  } catch (e) {
    console.log(e);
  }
});

// Login User

router.post("/login", async (req, res) => {
  console.log(req.body);
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const passConfirm = await bcrypt.compare(req.body.password, user.password);
    if (passConfirm) {
      // console.log(passConfirm);
      const token = createToken(user._id);
      res.cookie("clubToken", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      });
      res.status(200).send({ data: user, token: token });
      // User.findOneAndUpdate({ email: req.body.email }, {});
      // res.send({ data: user , token:token});
    } else {
      res.status(400).send({ message: "كلمة المرور غير صحيحة" });
    }
  } else {
    res.status(400).send({ message: "ليس لديك حساب لدينا يرجى انشاء حساب" });
  }
});

// User Login with Google

router.get("/login/success", (req, res) => {
  // console.log(req);
  if (req.user) {
    const token = createToken(req.user._id);
    res.cookie("clubToken", token, {
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: maxAge * 1000,
    });
    res.status(200).send({ data: req.user, token: token });
    // res.json({ error: false, message: "Success Loged In", user: req.user });
  } else {
    res.send({
      error: true,
      message: "Not Authorized",
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.json({
    error: true,
    message: "Log in failure",
  });
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    failureRedirect: process.env.CLIENT_URL,
  }),
  (req, res) => {
    console.log(req.user);
    const token = createToken(req.user._id);
    res.cookie("clubToken", token, {
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: maxAge * 1000,
    });

    res.redirect(process.env.CLIENT_URL);
  }
);

// User Forget Password

router.post("/forget-pass", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = createToken(user._id);
    // Enable secure when publish
    res.cookie("clubToken", token, {
      // secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: maxAge * 1000,
    });

    const link = `${process.env.CLIENT_URL}/password-reset/${user._id}`;
    await sendMail(user.email, "Password Reset", link);

    res.send({ message: "تم إرسال رسالة الى إلايميل الخاص بيك" });
  } else {
    res.send({ message: "هذا الايميل لا يوجد له حساب لدينا" });
  }
});

// User Password Reset

router.post("/reset-pass", async (req, res) => {
  const token = req.cookies.clubToken;
  if (token) {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.send({ message: err.message });
        } else {
          console.log(decodedToken);
          const passwordNew = await bcrypt.hash(req.body.password, 10);
          User.findOneAndUpdate(
            { _id: decodedToken.id },
            { password: passwordNew },
            (err, data) => {
              if (err) {
                console.log(err);
                res.send({ message: "حدث خطا أثناء تعديل الباسورد" });
              } else {
                res.send({ message: "تم تعديل الباسورد بنجاح" });
              }
            }
          );
        }
      }
    );
  } else {
    res.send({ message: "غير مصرح لك بتعديل البيانات" });
  }
});

// Logout User

router.post("/logout", (req, res) => {
  res.cookie("clubToken", "", { maxAge: 1 });
  res.redirect(process.env.CLIENT_URL);
});

// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/sucess",
//     failureRedirect: "/login-failed",
//     failureFlash: true,
//   })
// );

// router.get("/sucess", (req, res) => {
//   res.send("hello success");
// });

// router.get("/login-failed", (req, res) => {
//   res.send("hello failed");
// });

//User Photo Update
router.patch(
  "/user-photo-update",
  requireAuth,
  upload.single("personalphoto"),
  async (req, res) => {
    console.log(req.file);
    console.log(req.body);

    var id = req.body._id;
    console.log(id);
    var personalphoto = correctPath(req.file?.path);
    console.log(personalphoto);
    User.findOneAndUpdate(
      { _id: id },
      {
        personalphoto: personalphoto,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
          res.send({ message: "تم تعديل الصوره الشخصيه" });
        }
      }
    );
  }
);
// Update User

router.patch("/user-details-update", requireAuth, async (req, res) => {
  console.log(req.file);
  console.log(req.body);

  var id = req.body._id;
  console.log(id);
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var number = req.body.number;
  User.findOneAndUpdate(
    { _id: id },
    {
      firstname: firstname,
      lastname: lastname,
      email: email,
      number: number,
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.send({ message: "تم تعديل البيانات بنجاح" });
      }
    }
  );
});

// user-password-update
router.patch("/user-password-update", requireAuth, async (req, res) => {
  console.log(req.file);
  console.log(req.body);
  var id = req.body._id;
  console.log(id);
  var email = req.body.email;
  var passwordNew = await bcrypt.hash(req.body.password, 10);
  // const passwordNew = req.body.password;
  console.log(passwordNew);
  User.findOneAndUpdate(
    { _id: id },
    {
      email: email,
      password: passwordNew,
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.send({ message: "تم تعديل البيانات بنجاح" });
      }
    }
  );
});
// User.findById(id, async function (err, data) {
//   console.log(data);
//   data.firstname = firstname ? firstname : data.firstname;
//   data.lastname = lastname ? lastname : data.lastname;
//   data.email = email ? email : data.email;
//   (await bcrypt.compare(passwordNew, data.password)) == true
//     ? data.password
//     : passwordNew;
//   data.number = number ? number : data.number;
//   data.personalphoto = personalphoto ? personalphoto : data.personalphoto;
//   console.log(personalphoto);

//   data
//     .save()
//     .then((doc) => {
//       // res.status(201).json({
//       //   message: "تم تعديل بيانات الملعب بنجاح",
//       //   results: doc,
//       // });
//       console.log(doc);
//       res.send({ message: "تم تعديل البيانات بنجاح" });
//     })
//     .catch((err) => {
//       console.log(err.message);
//       res.send({ message: "حدث خطأ أثناء التعديل" });
//     });
// });

// Delete User

module.exports = router;
