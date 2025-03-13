import express from "express";
import authenticate from "../middlewares/authMiddleware.js";

import {
  checkEmail,
  checkUsername,
  deleteUser,
  getAllUsers,
  userLogin,
  userProfile,
  userSignup,
} from "../controlers/user.controler.js";

const router = express.Router();

// Check if a username already exists
router.get("/check-username/:username", checkUsername);

// Check if an email already exists
router.get("/check-email/:email", checkEmail);

router.post("/signup", userSignup);

router.post("/login", userLogin);

router.get("/users/profile/:username", authenticate, userProfile);

//get all users. this route is not protected it's just for testing purpose
router.get("/users", getAllUsers);

//This deletion is just for testing purpose.
router.delete("/users/:id", deleteUser);

export default router;
