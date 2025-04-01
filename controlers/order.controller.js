import Order from "../models/order.model.js";
import GeneralUser from "../models/generalUser.model.js"; // Import GeneralUser model

// Store an order
export const storeOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingInformation, status, paymentMethod } =
      req.body;
    const userId = req.user.id; // Assuming `verifyToken` middleware adds `user` to `req`
    console.log(req.body);
    const newOrder = new Order({
      userId,
      items,
      shippingInformation,
      status: status || "Pending", // Default status
      totalAmount,
      paymentMethod,
    });

    await newOrder.save();

    // ✅ Add the order ID to the user's orders field
    const user = await GeneralUser.findById(userId);
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
