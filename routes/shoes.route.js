import express from "express";
import {
  addCategoryRating,
  addReview,
  addShoe,
  deleteShoe,
  getAllShoes,
  getRatingsAndReviews,
  getShoeById,
  getShoesWithFilteredAndPagination,
  updateShoe,
} from "../controlers/shoes.controller.js";
import authenticate from "../middlewares/auth.admin.js";
import { isAuthenticated } from "../middlewares/auth.user.js";

const router = express.Router();

//get data with pagination
router.get("/paginated", getShoesWithFilteredAndPagination);

//get all shoes
router.get("/", getAllShoes);

//get a shoes by id
router.get("/:id", getShoeById);

//add a shoe (admin only)
router.post("/add", authenticate, addShoe);

// ✅ POST Route: Add a review to a specific shoe by ID (user only)
router.post("/:id/review", isAuthenticated, addReview);

// catagroy rating route
router.post("/:id/category-rating", isAuthenticated, addCategoryRating);
//delete a shoe (admin only)
router.delete("/:id", authenticate, deleteShoe);

//update a shoe (admin only)
router.put("/update/:id", authenticate, updateShoe);

// Route to get only ratings and reviews of a shoe by ID
router.get("/:id/ratings-reviews", getRatingsAndReviews);

export default router;
