import jwt from "jsonwebtoken";
import User from "../models/admin.model.js";
import dotenv from "dotenv";
dotenv.config();
const encodingKey = process.env.TOKEN_SECRET_KEY;

async function authenticate(req, res, next) {
  const autHeaders = req.headers["authorization"];
  if (autHeaders) {
    const token = autHeaders.split(" ")[1];
    //verify the token
    try {
      const decodedToken = jwt.verify(token, encodingKey);
      if (decodedToken) {
        const { username } = decodedToken;
        const persistedUser = await User.findOne({ username });
        if (persistedUser) {
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
export default authenticate;
