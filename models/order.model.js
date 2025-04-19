import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: { type: String, required: true },
        img: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      methodName: { type: String, required: true },
      payStatus: { type: Boolean, default: false },
    }, // e.g., Credit Card, PayPal, bkash, cash on delivery, etc.
    status: { type: String, default: "Pending" }, // e.g., Pending, Canceled, Completed
    shippingInformation: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      deliveryMethod: { type: String, default: "standard" }, // e.g., Standard, Express optional field
      deliveryLocation: { type: String || null }, // Optional field
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
