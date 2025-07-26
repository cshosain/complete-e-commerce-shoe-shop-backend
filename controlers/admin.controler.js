import Admin from "../models/admin.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//CONTROLER FUNC. FOR CHECK IF A USERNAME ALREADY EXIST OR NOT
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const existingUser = await Admin.findOne({ username });

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

// CONTROLER FOR CHECK EMAIL AVAILABILITY
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const existingUser = await Admin.findOne({ email });
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

// CONTROLER FOR ADMIN SIGNUP
export const adminSignup = async (req, res) => {
  // Check if a file was uploaded
  let path, filename;
  if (!req.file) {
    path = "uploads\\1753552482789-no-avatar.jpeg";
    filename = "1753552482789-no-avatar.jpeg";
  } else {
    path = req.file.path;
    filename = req.file.filename;
  }
  if (!req.body.email || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Email, username, and password are required" });
  }
  const avatar = { path, filename };
  console.log("Avatar:", avatar);
  try {
    const new_user = await Admin.create({
      ...req.body,
      avatar,
    });
    return res.status(200).json({
      success: true,
      data: new_user,
      message: "Admin added successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CONTROLER FOR ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const foundUser = await Admin.findOne({ username });
    if (foundUser) {
      if (foundUser.username === username && foundUser.password === password) {
        //generate token
        const token = jwt.sign({ username: foundUser.username }, "SECRETKEY");
        res.status(200).json({
          success: true,
          token: token,
          message: "Admin authenticated",
        });
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

// CONTROLER FOR ADMIN PROFILE VIEW
export const adminProfile = async (req, res) => {
  const username = req.params.username;
  const persistedUser = await Admin.findOne({ username });
  res.json({ success: true, data: persistedUser });
};

//CONTROLER FOR GET ALL USERS
export const getAllAdmins = async (req, res) => {
  try {
    const users = await Admin.find({});
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

//CONTROLER FOR DELETE A ADMIN
export const deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Admin.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      data: user,
      message: "Admin deleted successfully!",
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Controller for getting all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller for updating order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Order status updated",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller for soft deleting a user
export const softDeleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(
      id,
      { is_active: false, deleted_at: new Date() },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }
    res.status(200).json({
      success: true,
      data: user,
      message: "User soft deleted successfully!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
