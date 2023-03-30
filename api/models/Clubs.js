const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    playgroundname: {
      type: String,
      require: true,
    },
    photoURL: {
      type: String,
    },
    address: {
      type: String,
      require: true,
    },
    phonenumber: {
      type: String,
      require: true,
    },
    vodafonnumber: {
      type: String,
      require: true,
    },
    requests: {
      type: Array,
    },
    table: {
      type: Array,
    },
    createdDate: {
      type: String,
    },
  },
  {
    versionKey: false,
    strict: false,
  }
);
club = mongoose.model("clubs", clubSchema);
module.exports = club;
