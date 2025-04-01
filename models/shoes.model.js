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
      average: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Function to calculate and update average rating
shoeSchema.methods.calculateAverageRating = async function () {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.total = 0;
  } else {
    const totalReviews = this.reviews.length;
    const sumRatings = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.ratings.average = sumRatings / totalReviews;
    this.ratings.total = totalReviews;
  }
  await this.save(); // Save updated rating in DB
};

const Shoe = mongoose.model("Shoe", shoeSchema);
export default Shoe;
