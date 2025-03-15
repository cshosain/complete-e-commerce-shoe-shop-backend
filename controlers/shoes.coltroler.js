import mongoose from "mongoose";
import Shoe from "../models/shoes.model.js";

//healper function will remove letter
const formatPrice = (text) => {
  let slicedPrice = { maxRange: 9999, minRange: 0 };

  //if the price section includes 'above' min price written befor '-' else after '-'
  if (text.indexOf("above") != -1) {
    slicedPrice.minRange = parseFloat(
      text.slice(1, text.indexOf("-") - 1).trim()
    );
  } else {
    slicedPrice.maxRange = parseFloat(text.slice(text.indexOf("-") + 1).trim());
    slicedPrice.minRange = parseFloat(
      text.slice(1, text.indexOf("-") - 1).trim()
    );
    console.log(
      "format function val: ",
      parseFloat(text.slice(1, text.indexOf("-") - 1).trim())
    );
  }
  return slicedPrice;
};

//add a new shoe (experimental)
export const addShoe = async (req, res) => {
  try {
    const NewShoe = await Shoe.create(req.body);
    res
      .status(200)
      .json({ success: true, message: "added successfully", data: NewShoe });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Add shoe failed" });
  }
};

// CONTROLER FOR DELETE A SHOE
export const deleteShoe = async (req, res) => {
  const { id } = req.params;
  console.log("shoe id: ", id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User Id" });
  }
  try {
    await Shoe.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Product (shoe) deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
    console.log(error);
  }
};

//GET ALL SHOES
export const getAllShoes = async (req, res) => {
  try {
    const shoes = await Shoe.find({});
    res.status(200).json({ success: true, data: shoes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//GET FILTERED DATA WITH PAGINATION
export const getShoesWithFilteredAndPagination = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
    const page = parseInt(req.query.page) || 1; // default to the first

    // Calculate how many items to skip
    const skip = (page - 1) * limit;

    // Build filter query based on filter criteria
    let filterQuery = {};
    if (req.query.brand && req.query.brand !== "All Products") {
      filterQuery.company = req.query.brand; // Filter by brand if not 'all'
    }

    if (req.query.category && req.query.category !== "all") {
      filterQuery.category = req.query.category.toLowerCase();
    }

    if (req.query.color && req.query.color !== "all") {
      filterQuery.color = req.query.color.toLowerCase();
    }

    // Add keyword search for title
    if (req.query.keyword) {
      const keyword = req.query.keyword;
      filterQuery.title = { $regex: keyword, $options: "i" }; // Case-insensitive search on title
    }

    // Add price range filter in MongoDB
    if (req.query.price && req.query.price !== "all") {
      const slicedPrice = formatPrice(req.query.price); // formatPrice should return minRange and maxRange

      if (!isNaN(slicedPrice.minRange) && !isNaN(slicedPrice.maxRange)) {
        filterQuery.newPrice = {
          $gte: slicedPrice.minRange,
          $lte: slicedPrice.maxRange,
        };
      } else if (!isNaN(slicedPrice.minRange)) {
        filterQuery.newPrice = { $gte: slicedPrice.minRange }; // For ranges like "200 - above"
      } else if (!isNaN(slicedPrice.maxRange)) {
        filterQuery.newPrice = { $lte: slicedPrice.maxRange }; // For ranges like "up to 200"
      } else {
        return res.status(500).json({
          success: false,
          message: `Invalid price range value! ${req.query.price}. Please provide correct format, e.g. '$100 - 200'`,
        });
      }
    }

    let shoes = await Shoe.find(filterQuery).limit(limit).skip(skip);

    // Optional: Get total count for pagination metadata (e.g., total pages)
    const totalItems = await Shoe.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      data: shoes,
      hasMore: totalPages > page,
      page,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
