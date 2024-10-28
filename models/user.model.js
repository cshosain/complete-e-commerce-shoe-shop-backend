const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: false,
    },
    firstName: {
      type: String,
      required: false,
      unique: false,
    },
    lastName: {
      type: String,
      required: false,
      unique: false,
    },
    gender: {
      type: String,
      required: false,
      unique: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
