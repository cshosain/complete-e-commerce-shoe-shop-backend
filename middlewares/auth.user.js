import User from "../models/user.model.js";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token.", 401));
  }
  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  next();
});
