import mongoose from "mongoose";

const shoeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    img: { type: String, required: true },
    images: [{ type: String }],
    newPrice: { type: Number, required: true },
    prevPrice: { type: Number },
    discount: { type: Number, default: 0 },
    availableColors: [{ type: String }],
    availableSizes: [{ type: Number }],
    stock: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false },
    ratings: {
      averageRating: { type: Number, default: 0 },
      noOfRatings: { type: Number, default: 0 },
      ratingsBreakdown: [
        {
          star: { type: Number, required: true },
          count: { type: Number, required: true },
        },
      ],
      categoryRatings: [
        {
          userName: {
            type: String,
            required: true,
          },
          comfort: { type: Number, default: 0 },
          durability: { type: Number, default: 0 },
          style: { type: Number, default: 0 },
          fit: { type: Number, default: 0 },
          valueForMoney: { type: Number, default: 0 },
        },
      ],
      averageCategoryRatings: {
        comfort: { type: Number, default: 0 },
        durability: { type: Number, default: 0 },
        style: { type: Number, default: 0 },
        fit: { type: Number, default: 0 },
        valueForMoney: { type: Number, default: 0 },
      },
      noOfCategoryRatings: { type: Number, default: 0 },
    },
    reviews: [
      {
        userName: { type: String, required: false },
        UserImg: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        images: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Function to calculate and update average rating
shoeSchema.methods.calculateAverageRating = async function () {
  if (this.reviews.length === 0) {
    this.ratings.averageRating = 0;
    this.ratings.noOfRatings = 0;
    this.ratings.ratingsBreakdown = [
      { star: 5, count: 0 },
      { star: 4, count: 0 },
      { star: 3, count: 0 },
      { star: 2, count: 0 },
      { star: 1, count: 0 },
    ];
  } else {
    const totalReviews = this.reviews.length;
    const sumRatings = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.ratings.averageRating = sumRatings / totalReviews;
    this.ratings.noOfRatings = totalReviews;

    const breakdown = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: this.reviews.filter((review) => review.rating === star).length,
    }));
    this.ratings.ratingsBreakdown = breakdown;
  }
  this.save();
};

// Function to calculate and update category ratings
shoeSchema.methods.calculateCategoryRatings = async function (
  userName,
  newCategoryRatings
) {
  // Check if the user already has category ratings
  const existingEntry = this.ratings.categoryRatings.find(
    (entry) => entry.userName.toString() === userName.toString()
  );

  if (existingEntry) {
    // Update the existing user's category ratings
    Object.keys(newCategoryRatings).forEach((category) => {
      if (category !== "userName") {
        // Only update the category ratings if they exist in the new ratings
        existingEntry[category] = newCategoryRatings[category];
      }
    });
  } else {
    // Add a new entry for the user
    this.ratings.categoryRatings.push({ userName, ...newCategoryRatings });
  }

  // Recalculate averageCategoryRatings and noOfCategoryRatings
  const totalRatings = this.ratings.categoryRatings.length;
  console.log(totalRatings, "totalRatings");
  // calculate total ratings for each category
  const totalCategoryRatings = this.ratings.categoryRatings.reduce(
    (acc, entry) => {
      acc.comfort += entry.comfort;
      acc.durability += entry.durability;
      acc.style += entry.style;
      acc.fit += entry.fit;
      acc.valueForMoney += entry.valueForMoney;
      return acc;
    },
    {
      comfort: 0,
      durability: 0,
      style: 0,
      fit: 0,
      valueForMoney: 0,
    }
  );
  // Calculate average for each category
  this.ratings.averageCategoryRatings.comfort =
    totalCategoryRatings.comfort / totalRatings;
  this.ratings.averageCategoryRatings.durability =
    totalCategoryRatings.durability / totalRatings;
  this.ratings.averageCategoryRatings.style =
    totalCategoryRatings.style / totalRatings;
  this.ratings.averageCategoryRatings.fit = this.ratings.noOfCategoryRatings =
    totalRatings;

  await this.save();
};

const Shoe = mongoose.model("Shoe", shoeSchema);
export default Shoe;
