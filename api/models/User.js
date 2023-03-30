const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    personalphoto: {
      type: String,
    },
    userplaygrounds: [{ type: mongoose.Types.ObjectId, ref: "clubs" }],
    dateRegister: {
      type: String,
    },
  },
  {
    versionKey: false,
    strict: false,
  }
);
user = mongoose.model("User", userSchema);
module.exports = user;
