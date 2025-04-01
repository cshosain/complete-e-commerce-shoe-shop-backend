import express from "express";
import {
  addGeneralUser,
  addToCart,
  deleteGeneralUser,
  getAllGeneralUsers,
  getUserCart,
  getUserProfile,
  loginGeneralUser,
  removeCartItem,
  updateCart,
  updateGeneralUser,
  updateProfile,
} from "../controlers/generalUser.controler.js";
import { verifyToken } from "../middlewares/generalUser/authMiddleware.generalUser.js";
import authenticate from "../middlewares/authMiddleware.js";
import { storeOrder, cancelOrder } from "../controlers/order.controller.js";

const router = express.Router();

//view cart
router.get("/cart/:id", verifyToken, getUserCart);
//Add to cart(user only)
router.post("/cart", verifyToken, addToCart);

// update cart
router.put("/cart/update/:userId", verifyToken, updateCart);

//delete a cart item
router.delete("/cart/remove/:userId/:cartId", verifyToken, removeCartItem);

//GET USERS
router.get("/", getAllGeneralUsers);

// Login Route
router.post("/auth/login", loginGeneralUser);

// Signup Route (user-> signup/ admin-> addUser)
router.post("/signup", addGeneralUser);

// ✅ Get User Profile(user only)
router.get("/profile", verifyToken, getUserProfile);

// ✅ Update User Profile BY USER ONLY
router.put("/update-profile", verifyToken, updateProfile);

//UPDATE A USER BY ADMIN
router.put("/:id", authenticate, updateGeneralUser);

//DELETE A USER BY ADMIN
router.delete("/:id", authenticate, deleteGeneralUser);

// ✅ Store an order (user only)
router.post("/orders", verifyToken, storeOrder);

// ✅ Cancel an order (admin only)
router.delete("/orders/:orderId", authenticate, cancelOrder);

export default router;
