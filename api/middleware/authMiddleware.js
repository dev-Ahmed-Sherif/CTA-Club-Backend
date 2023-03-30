const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const requireAuth = (req, res, next) => {
  const token = req.cookies.clubToken;

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.send({ message: err.message });
      } else {
        console.log(decodedToken);
        // const loginUser = await User.findById(decodedToken.id);
        next();
      }
    });
  } else {
    res.send({ message: "Invlaid Access" });
  }
};

module.exports = { requireAuth };
