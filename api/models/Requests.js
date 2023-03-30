const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    date: {
      type: String,
      require: true,
    },
    from: {
      type: String,
      require: true,
    },
    to: {
      type: String,
      require: true,
    },
    number: {
      type: String,
      require: true,
    },
    vodanumber: {
      type: String,
      require: true,
    },
    requests: {
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
request = mongoose.model("requests", requestSchema);
module.exports = request;
