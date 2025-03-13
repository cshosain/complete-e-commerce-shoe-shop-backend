import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//CONTROLER FUNC. FOR CHECK IF A USERNAME ALREADY EXIST OR NOT
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: "Username already taken",
      });
    } else {
      return res
        .status(200)
        .json({ success: true, exists: false, message: "Username available" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CONTROLER FOR CHECK EMAIL
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: "Email Already Taken",
      });
    } else {
      return res
        .status(200)
        .json({ success: true, exists: false, message: "Email Available" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CONTROLER FOR USER SIGNUP
export const userSignup = async (req, res) => {
  try {
    const new_user = await User.create(req.body);
    return res.status(200).json({
      success: true,
      data: new_user,
      message: "User added successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CONTROLER FOR USER LOGIN
export const userLogin = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      if (foundUser.username === username && foundUser.password === password) {
        //generate token
        const token = jwt.sign({ username: foundUser.username }, "SECRETKEY");
        res
          .status(200)
          .json({ success: true, token: token, message: "User authenticated" });
      } else {
        // response with not authenticated
        res.json({ success: false, message: "Not authenticated" });
      }
    } else {
      res.json({
        success: false,
        message: "No user exist with this username!",
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CONTROLER FOR USER PROFILE VIEW
export const userProfile = async (req, res) => {
  const username = req.params.username;
  const persistedUser = await User.findOne({ username });
  res.json({ success: true, data: persistedUser });
};

//CONTROLER FOR GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

//CONTROLER FOR DELETE A USER
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      data: user,
      message: "User deleted successfully!",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
