import mongoose from "mongoose";
import { createSuperAdmin } from "../services/common_utils.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URL || "mongodb://localhost:27017/LinkedIn-Clone"
    );

    console.log("✅ DB connection successful");
    await createSuperAdmin();

    mongoose.connection.on("close", () => {
      console.log("⚠ DB connection CLOSED");
    });
  } catch (error) {
    console.error("❌ ERROR IN CONNECTING DB:", error);
  }
};
