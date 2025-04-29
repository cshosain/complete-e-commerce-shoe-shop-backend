import express from "express";
const router = express.Router();
import paymentBkashControler from "../controlers/payment.bkash.controller.js";
const { payment_create, call_back, refund } = paymentBkashControler;
import middleware from "../middlewares/payment/middleware.bkash.js";

router.post("/create", middleware.bkash_auth, payment_create);

router.get("/callback", middleware.bkash_auth, call_back);

router.get("/refund/:trxID", middleware.bkash_auth, refund);

export default router;
