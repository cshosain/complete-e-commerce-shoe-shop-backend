import Order from "../models/order.model.js";
import User from "../models/user.model.js"; // Import User model

// Store an order
export const storeOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingInformation, status, paymentMethod } =
      req.body;
    const { _id } = req.user; // Extract user ID from the request
    const newOrder = new Order({
      userId: _id, // Use the user ID from the request
      items,
      shippingInformation,
      status: status || "Pending", // Default status
      totalAmount,
      paymentMethod,
    });

    await newOrder.save();

    // ✅ Add the order ID to the user's orders field
    const user = await User.findById(_id);
    if (user) {
      user.cart = []; // Clear the cart
      user.orders.push(newOrder._id); // Add the order ID to the orders field
      await user.save();
    }

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};

// Cancel an order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Canceled";
    await order.save();

    res.status(200).json({ message: "Order canceled successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to cancel order", error: error.message });
  }
};

// Get all orders for the authenticated user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};
