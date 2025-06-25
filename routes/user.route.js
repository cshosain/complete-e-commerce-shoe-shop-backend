import express from "express";
import {
  addToCart,
  checkEmail,
  forgotPassword,
  getAllUsers,
  getUser,
  getUserCart,
  loginGeneralUser,
  logout,
  register,
  removeCartItem,
  resetPassword,
  updateCart,
  updateProfile,
  verifyOTP,
} from "../controlers/user.controller.js";

import { storeOrder, getUserOrders } from "../controlers/order.controller.js";
import { isAuthenticated } from "../middlewares/auth.user.js";

const router = express.Router();

//GET ALL USERS
router.get("/", getAllUsers);

// view cart
router.get("/cart", isAuthenticated, getUserCart);
// Add to cart(user only)
router.post("/cart/add", isAuthenticated, addToCart);
// update cart
router.put("/cart/update", isAuthenticated, updateCart);
//delete a cart item
router.delete("/cart/remove/:cartId", isAuthenticated, removeCartItem);

// Store an order (user only)
router.post("/orders/store", isAuthenticated, storeOrder);

// Get all orders for the authenticated user
router.get("/orders", isAuthenticated, getUserOrders);

// Update User Profile BY USER
router.put("/update-profile", isAuthenticated, updateProfile);

// Authentication Routes
router.post("/register", register);
router.post("/register/check-email", checkEmail);
router.post("/otp-verification", verifyOTP);
router.post("/login", loginGeneralUser);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

// Simple route to check authentication status
router.get("/auth/check", isAuthenticated, (req, res) => {
  res.status(200).json({ success: true, message: "User is authenticated." });
});

export default router;
