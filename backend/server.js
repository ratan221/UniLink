// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import path from "path";

// import authRoutes from "./routes/auth.route.js";
// import userRoutes from "./routes/user.route.js";
// import postRoutes from "./routes/post.route.js";
// import notificationRoutes from "./routes/notifications.route.js";
// import connectionRoutes from "./routes/connections.route.js";

// import { connectDB } from "./lib/db.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve();

// if (process.env.NODE_ENV !== "production") {
// 	app.use(
// 		cors({
// 			origin: "http://localhost:5173",
// 			credentials: true,
// 		})
// 	);
// }

// app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
// app.use(cookieParser());

// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/posts", postRoutes);
// app.use("/api/v1/notifications", notificationRoutes);
// app.use("/api/v1/connections", connectionRoutes);

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "/frontend/dist")));

// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// 	});
// }

// app.listen(PORT, () => {
// 	console.log(`Server running on port ${PORT}`);
// 	connectDB();
// });

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notifications.route.js";
import connectionRoutes from "./routes/connections.route.js";
// import chatRoutes from "./routes/chat.route.js"; // Chat routes

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
		credentials: true,
	},
});

if (process.env.NODE_ENV !== "production") {
	app.use(
		cors({
			origin: "http://localhost:5173",
			credentials: true,
		})
	);
}

app.use(express.json({ limit: "5mb" })); // Parse JSON request bodies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
// app.use("/api/v1/chats", chatRoutes); // Chat API routes

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Socket.io connection handling
io.on("connection", (socket) => {
	console.log(`User connected: ${socket.id}`);

	// Join room for private chat
	socket.on("joinRoom", (room) => {
		socket.join(room);
		console.log(`User joined room: ${room}`);
	});

	// Listen for messages
	socket.on("sendMessage", (data) => {
		const { room, message, sender } = data;
		io.to(room).emit("receiveMessage", { message, sender });
	});

	// Disconnect event
	socket.on("disconnect", () => {
		console.log(`User disconnected: ${socket.id}`);
	});
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	connectDB();
});
