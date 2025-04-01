import mongoose from "mongoose";

const generalUserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    img: { type: String },
    password: { type: String, required: true }, // Add password field
    cart: [
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
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order", // Reference to the Order model
      },
    ],
  },
  { timestamps: true }
);

const GeneralUser = mongoose.model("GeneralUser", generalUserSchema);
export default GeneralUser;
