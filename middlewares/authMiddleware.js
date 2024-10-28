const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
// Load environment variables from .env file
require("dotenv").config();
const encodingKey = process.env.TOKEN_SECRET_KEY;

async function authenticate(req, res, next) {
  const autHeaders = req.headers["authorization"];
  if (autHeaders) {
    const token = autHeaders.split(" ")[1];
    //verify the token
    try {
      const decodedToken = jwt.verify(token, encodingKey);
      if (decodedToken && decodedToken.username == req.params.username) {
        const username = req.params.username;
        //const persistedUser = users.find((user) => user.username == username);
        const persistedUser = await User.findOne({ username });
        if (persistedUser) {
          //   res.json({ success: true, data: persistedUser });
          // The authention is successfull
          next();
        } else {
          res.json({ success: false, message: "User does not exist" });
        }
      } else {
        res
          .status(401)
          .json({ success: false, message: "User does not exist or loged in" });
      }
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Authentication token is tampered" });
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: "No authorization header found!" });
  }
}
module.exports = authenticate;
