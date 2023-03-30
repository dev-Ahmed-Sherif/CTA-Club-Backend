// Design Server
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
// Call Mongo DB Connection
const mongo = require("./api/config/mongoose");

const passport = require("passport");
require("./api/passport-config");

// Define Routes
const userRouter = require("./api/routes/userRoutes");
const clubRouter = require("./api/routes/clubRoutes");

// middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
// app.use((req, res, next) => {
//   res.set("Access-Control-Allow-Origin", "*");
//   next();
// });
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/public/club", express.static("public/club"));
app.use("/public/person", express.static("public/person"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/clubs", clubRouter);

app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.PORT || 5000, () => {
  console.log("running on", process.env.PORT);
});

app.get("/", (req, res) => {
  res.send("hello");
});

//  Old
// App.listen(3000, () => {
//   console.log("running");
// });
