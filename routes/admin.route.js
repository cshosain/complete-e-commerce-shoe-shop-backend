import express from "express";
import authenticate from "../middlewares/auth.admin.js";

import {
  adminLogin,
  adminProfile,
  adminSignup,
  checkEmail,
  checkUsername,
  deleteAdmin,
  getAllAdmins,
} from "../controlers/admin.controler.js";
import { cancelOrder } from "../controlers/order.controller.js";

const router = express.Router();

// Check if a username already exists
router.get("/check-username/:username", checkUsername);

// Check if an email already exists
router.get("/check-email/:email", checkEmail);

router.post("/signup", adminSignup);

router.post("/login", adminLogin);

router.get("/users/profile/:username", authenticate, adminProfile);

//get all users. this route is not protected it's just for testing purpose
router.get("/users", getAllAdmins);
// Cancel an order (admin only)
router.put("/orders/cancel/:orderId", authenticate, cancelOrder);
// DELETE A USER BY ADMIN
router.delete("/remove/:id", authenticate, deleteAdmin);

export default router;
