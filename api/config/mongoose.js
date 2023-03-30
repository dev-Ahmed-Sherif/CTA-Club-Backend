require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
// mongoose
//   .connect(
//     "mongodb+srv://Ahmed:as1me2ba3ah4@football-reservation.2wq2avr.mongodb.net/?retryWrites=true&w=majority",
//     { useNewUrlParser: true }
//   )
//   .then((x) => {
//     console.log("DB connection is open");
//   });

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("DB connection is opened"));
