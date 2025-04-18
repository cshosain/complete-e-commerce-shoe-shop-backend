import express from "express";
import {
  addToCart,
  checkEmail,
  deleteGeneralUser,
  forgotPassword,
  getAllGeneralUsers,
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

import authenticate from "../middlewares/auth.admin.js";
import { storeOrder, cancelOrder } from "../controlers/order.controller.js";
import { isAuthenticated } from "../middlewares/auth.user.js";

const router = express.Router();

//GET ALL USERS
router.get("/", getAllGeneralUsers);

// view cart
router.get("/cart/:id", isAuthenticated, getUserCart);
// Add to cart(user only)
router.post("/cart/add", isAuthenticated, addToCart);
// update cart
router.put("/cart/update/:userId", isAuthenticated, updateCart);
//delete a cart item
router.delete("/cart/remove/:userId/:cartId", isAuthenticated, removeCartItem);

// Store an order (user only)
router.post("/orders/store", isAuthenticated, storeOrder);
// Cancel an order (admin only)
router.delete("/orders/cancel/:orderId", authenticate, cancelOrder);

// Update User Profile BY USER
router.put("/update-profile", isAuthenticated, updateProfile);
// DELETE A USER BY ADMIN
router.delete("/remove/:id", authenticate, deleteGeneralUser);

// Authentication Routes
router.post("/register", register);
router.post("/register/check-email", checkEmail);
router.post("/otp-verification", verifyOTP);
router.post("/login", loginGeneralUser);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
