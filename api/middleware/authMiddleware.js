
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const requireAuth = (req, res, next) => {
//   console.log(req.cookies);
  console.log(req);
  console.log(req.body);
  const token1 = req.body.clubToken;
  //const token2 = req.Cookies.clubToken;
  console.log(token1);
  //console.log(token2);
  if (token1) {
    jwt.verify(token1, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
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
