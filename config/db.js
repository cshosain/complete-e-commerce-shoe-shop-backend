import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGODB_CONNECTION_STRING;
const SECONDARY_URI = process.env.DB_URL;

if (!MONGO_URI || !SECONDARY_URI) {
  console.error(
    "❌ MongoDB connection string is missing! Check your .env file."
  );
  process.exit(1); // Stop server if DB URL is missing
}
let primaryConnection = null;
let secondaryConnection = null;

const connectDB = async () => {
  if (primaryConnection && secondaryConnection) {
    console.log("Using existing MongoDB connections.");
    return { primary: primaryConnection, secondary: secondaryConnection };
  }

  try {
    // Connect to primary database
    if (!primaryConnection) {
      primaryConnection = await mongoose.connect(MONGO_URI);
      console.log(
        `Primary MongoDB connected: ${primaryConnection.connection.host}`
      );
    }

    // Connect to secondary database
    if (!secondaryConnection) {
      secondaryConnection = mongoose.createConnection(SECONDARY_URI);
      console.log(`Secondary MongoDB connected: ${SECONDARY_URI}`);
    }

    return { primary: primaryConnection, secondary: secondaryConnection };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Graceful shutdown to close connections on server stop
process.on("SIGINT", async () => {
  if (primaryConnection) {
    await mongoose.connection.close();
    console.log("Primary MongoDB connection closed.");
  }
  if (secondaryConnection) {
    await secondaryConnection.close();
    console.log("Secondary MongoDB connection closed.");
  }
  process.exit(0);
});

export default connectDB;
