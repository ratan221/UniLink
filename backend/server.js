import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";


import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notifications.route.js";
import connectionRoutes from "./routes/connections.route.js";


import { connectDB } from "./lib/db.js";



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

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
	app.use(
		cors({
			origin: "http://localhost:5173",
			credentials: true,
		})
	);
}

app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	connectDB();
});

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

