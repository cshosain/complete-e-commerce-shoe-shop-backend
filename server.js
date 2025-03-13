import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import generalUserRoutes from "./routes/generalUser.route.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

//FOR GENERAL USERS
app.use("/api/generalUsers", generalUserRoutes);
//FOR ADMIN USERS
app.use("/api", userRoutes);

app.listen(PORT, (req, res) => {
  connectDB();
  console.log(`Server is running at http://localhost:${PORT}`);
});
