import mongoose from "mongoose";
import GeneralUser from "../models/generalUser.model.js";
import Shoe from "../models/shoes.model.js";
// import bcrypt from "bcryptjs"; // For password hashing
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Login general user controler(used by bot user and admin)
export const loginGeneralUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await GeneralUser.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send response with token and user data
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        img: user.img,
        cart: user.cart, // Send user's cart
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//GET USER PROFILE INFO
export const getUserProfile = async (req, res) => {
  try {
    const user = await GeneralUser.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//UPDATE USER PROFILE INFO BY USER
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from authMiddleware
    const { firstName, lastName, img, password } = req.body;

    // ✅ Check if the user exists
    const user = await GeneralUser.findById(userId);
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
    const updatedUser = await GeneralUser.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true }
    );

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

//ADD A NEW USER CONTROLER
export const addGeneralUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, img, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !img || !password) {
      return res.status(500).json({
        success: false,
        message: "Please provide all the fields info.",
      });
    }
    // Check if user already exists
    const existingUser = await GeneralUser.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists!" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new GeneralUser({
      firstName,
      lastName,
      email,
      phone,
      img,
      password: hashedPassword, // Store hashed password
      cart: [], // Empty cart initially
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signup failed!",
      error: error.message,
    });
  }
};

// Add to cart
export const addToCart = async (req, res) => {
  const { userId, productId, size, color } = req.body;

  try {
    // Validate request data
    if (!userId || !productId || !size || !color) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check if user exists
    const user = await GeneralUser.findById(userId);
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
  console.log("called");
  try {
    console.log("params", req.params);
    const user = await GeneralUser.findById(req.params.id).select("cart");
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
  const { cartId, quantity } = req.body;

  try {
    const user = await GeneralUser.findById(req.params.userId);
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
  const { userId, cartId } = req.params;

  try {
    const user = await GeneralUser.findById(userId);
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
export const getAllGeneralUsers = async (req, res) => {
  try {
    const generalUsers = await GeneralUser.find({});
    res.status(200).json({ success: true, data: generalUsers });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

//CONTROLER FOR UPDATE A USER BY ADMIN
export const updateGeneralUser = async (req, res) => {
  const { id } = req.params;
  const generalUser = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User Id" });
  }

  try {
    const updatedGeneralUser = await GeneralUser.findByIdAndUpdate(
      id,
      generalUser,
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedGeneralUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
    console.log(error);
  }
};

//CONTROLER FUNCTION FOR DELETE A USER BY ADMIN
export const deleteGeneralUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User Id" });
  }
  try {
    await GeneralUser.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
    console.log(error);
  }
};
