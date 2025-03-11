import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";

// Load environment variables
dotenv.config();

// Debugging - Check if environment variables are loaded
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing. Check your .env file.");
    process.exit(1);
}
if (!process.env.PORT) {
    console.error("❌ PORT is missing. Check your .env file.");
    process.exit(1);
}


const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 if not set

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Start Server
app.listen(PORT, async () => {
    console.log(`Server is running on port: ${PORT}`);
    await connectDB(); // Connect to MongoDB when the server starts
});
