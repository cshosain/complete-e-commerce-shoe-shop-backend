import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: false,
    },
    firstName: {
      type: String,
      required: true,
      unique: false,
    },
    lastName: {
      type: String,
      required: true,
      unique: false,
    },
    gender: {
      type: String,
      required: true,
      unique: false,
    },
    avatar: {
      path: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", userSchema);
export default Admin;
