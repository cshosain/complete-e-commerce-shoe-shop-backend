const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const authenticate = require("./middlewares/authMiddleware");
const User = require("./models/user.model.js");
require("dotenv").config();
const myConnectionString = process.env.MONGODB_CONNECTION_STRING;
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  try {
    const new_user = await User.create(req.body);
    res.status(200).json(new_user);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({ username });
    if (user.username === username && user.password === password) {
      //generate token
      const token = jwt.sign({ username: user.username }, "SECRETKEY");
      res.status(200).json({ success: true, token: token });
    } else {
      // response with not authenticated
      res.json({ success: false, message: "Not authenticated" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/users/profile/:username", authenticate, async (req, res) => {
  const username = req.params.username;
  const persistedUser = await User.findOne({ username });
  res.json({ success: true, data: persistedUser });
});

//get all users. this route is not protected it's just for testing purpose
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

//This deletion is just for testing purpose.
app.delete("/users/:id", async (req, res) => {
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
});

mongoose
  .connect(myConnectionString)
  .then(() => {
    console.log("Connected to database");
  })
  .catch(() => {
    console.log("Connection failed");
  });

app.listen(PORT, (req, res) => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
