import mongoose from "mongoose";
import User from "../models/user.model.js";
import Shoe from "../models/shoes.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/sendToken.js";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

//check if email is already registered
export const checkEmail = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler("Email is required.", 400));
  }
  const existingUser = await User.findOne({
    email,
    accountVerified: true,
  });

  if (existingUser) {
    return res.status(200).json({
      success: false,
      message: "Email already taken.",
    });
  }
  res.status(200).json({
    success: true,
    message: "Email is available.",
  });
});
// Login general user controler(used by bot user and admin)
export const loginGeneralUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email,
      accountVerified: true,
    }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    sendToken(user, 200, "User logged in successfully.", res);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, verificationMethod } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !verificationMethod
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const existingUser = await User.findOne({
      $or: [
        { email, accountVerified: true },
        { phone, accountVerified: true },
      ],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Phone or Email is already used." });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
    });
    const verificationCode = user.generateVerificationCode();
    await user.save();

    sendVerificationCode(
      verificationMethod,
      verificationCode,
      `${firstName} ${lastName}`,
      email,
      phone,
      res
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  name,
  email,
  phone,
  res
) {
  try {
    if (verificationMethod === "email") {
      const message = `Your verification code is ${verificationCode}`;
      sendEmail({ email, subject: "Your Verification Code", message });
      res
        .status(200)
        .json({ success: true, message: `Verification email sent to ${name}` });
    } else if (verificationMethod === "phone") {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split("")
        .join(" ");
      await client.calls.create({
        twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}.</Say></Response>`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      res.status(200).json({ success: true, message: "OTP sent." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Invalid verification method." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Verification code failed to send." });
  }
}

export const verifyOTP = async (req, res) => {
  const { email, otp, phone } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false },
      ],
    });

    if (!user || user.verificationCode !== Number(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    if (Date.now() > user.verificationCodeExpire) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save();

    res.status(200).json({ success: true, message: "Account verified." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      accountVerified: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = `Your Reset Password Token is: ${resetPasswordUrl}`;

    sendEmail({ email: user.email, subject: "Reset Password", message });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send reset password email.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token." });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

//UPDATE USER PROFILE INFO BY USER
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from authMiddleware
    const { firstName, lastName, img, password } = req.body;

    // ✅ Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Prepare updated fields
    const updatedFields = {};
    if (firstName) updatedFields.firstName = firstName;
    if (lastName) updatedFields.lastName = lastName;
    if (img) updatedFields.img = img;

    // ✅ Hash new password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    // ✅ Update user profile
    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email, // Keep email but prevent updates
        phone: updatedUser.phone, // Keep phone if needed
        img: updatedUser.img,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Add to cart
export const addToCart = async (req, res) => {
  const { _id } = req.user; // Extract user ID from authMiddleware
  const { productId, size, color } = req.body;

  try {
    // Validate request data
    if (!_id || !productId || !size || !color) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check if user exists
    const user = await User.findById(_id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Check if product exists
    const shoe = await Shoe.findById(productId);
    if (!shoe)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Check if product already exists in cart (same product, size, and color)
    const existingCartItem = user.cart.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size == size &&
        item.color === color
    );

    if (existingCartItem) {
      // If item already exists, increase quantity
      existingCartItem.quantity += 1;
    } else {
      // Add new item to cart
      user.cart.push({
        productId,
        title: shoe.title,
        img: shoe.img,
        price: shoe.newPrice,
        size,
        color,
        quantity: 1,
      });
    }

    await user.save(); // Save changes to database

    res
      .status(200)
      .json({ success: true, message: "Item added to cart", cart: user.cart });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//view cart items (by user)
export const getUserCart = async (req, res) => {
  const { _id } = req.user; // Extract user ID from authMiddleware
  try {
    const user = await User.findById(_id).select("cart");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//update cart item (user)

export const updateCart = async (req, res) => {
  const { _id } = req.user; // Extract user ID from authMiddleware
  const { cartId, quantity } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Find cart item
    const cartItem = user.cart.find((item) => item._id.toString() === cartId);

    if (!cartItem)
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });

    if (quantity > 0) {
      cartItem.quantity = quantity; // Update quantity
    } else {
      // Remove item from cart if quantity is 0
      user.cart = user.cart.filter((item) => !(item._id.toString() === cartId));
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Cart updated", cart: user.cart });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE A SPECIFIC CART
export const removeCartItem = async (req, res) => {
  const { _id } = req.user; // Extract user ID from authMiddleware
  const { cartId } = req.params;

  try {
    const user = await User.findById(_id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Find cart item
    const cartItem = user.cart.find((item) => item._id.toString() === cartId);

    if (!cartItem)
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    // Remove item from cart
    user.cart = user.cart.filter((item) => !(item._id.toString() === cartId));

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Cart updated", cart: user.cart });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
//CONTROLER FOR GET ALL GENERAL USERS
export const getAllUsers = async (req, res) => {
  try {
    const generalUsers = await User.find({});
    res.status(200).json({ success: true, data: generalUsers });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

//CONTROLER FUNCTION FOR DELETE A USER BY ADMIN
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User Id" });
  }
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
    console.log(error);
  }
};
