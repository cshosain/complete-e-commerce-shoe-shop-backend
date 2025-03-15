import express from "express";
import {
  addShoe,
  deleteShoe,
  getAllShoes,
  getShoesWithFilteredAndPagination,
} from "../controlers/shoes.coltroler.js";

const router = express.Router();

//get all shoes
router.get("/", getAllShoes);

//add a shoe
router.post("/", addShoe);

//delete a shoe
router.delete("/:id", deleteShoe);

//get data with pagination
router.get("/paginated", getShoesWithFilteredAndPagination);

export default router;
