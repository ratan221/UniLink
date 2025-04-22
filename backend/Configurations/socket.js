// import { Server } from "socket.io";
// import User from "../models/User.js";

// export const setupSocket = (server) => {
//   const io = socketIo(server, {
//     pingTimeout: 60000,
//     cors: {
//       origin: process.env.CLIENT_URL || "http://localhost:3000",
//       credentials: true,
//     },
//   });

//   // Store active users
//   const activeUsers = new Map();

//   io.on("connection", (socket) => {
//     console.log("New client connected");

//     // Setup socket with user ID
//     socket.on("setup", async (userData) => {
//       socket.userId = userData._id;
//       socket.join(userData._id);
//       activeUsers.set(userData._id, socket.id);

//       // Update user status to online
//       await User.findByIdAndUpdate(userData._id, { status: "online" });

//       // Broadcast user online status
//       socket.broadcast.emit("user_status_changed", {
//         userId: userData._id,
//         status: "online",
//       });

//       console.log("User connected:", userData._id);

//       // Send list of online users to client
//       const onlineUsers = Array.from(activeUsers.keys());
//       socket.emit("online_users", onlineUsers);

//       // Broadcast to other users that this user is online
//       socket.broadcast.emit("user_online", userData._id);
//     });

//     // Join a chat room
//     socket.on("join_chat", (chatId) => {
//       socket.join(chatId);
//       console.log(`User ${socket.userId} joined chat: ${chatId}`);
//     });

//     // Typing indicator
//     socket.on("typing", (chatId) => {
//       socket.to(chatId).emit("typing", { chatId, userId: socket.userId });
//     });

//     // Stop typing indicator
//     socket.on("stop_typing", (chatId) => {
//       socket.to(chatId).emit("stop_typing", { chatId, userId: socket.userId });
//     });

//     // New message
//     socket.on("new_message", (message) => {
//       const chat = message.chat;

//       if (!chat.participants) return;

//       chat.participants.forEach((participant) => {
//         if (participant._id === message.sender._id) return;

//         // Send to user's personal room
//         socket.to(participant._id).emit("message_received", message);

//         // Also send to any chat room the participant is in
//         socket.to(chat._id).emit("message_received", message);
//       });
//     });

//     // Mark messages as read
//     socket.on("mark_messages_read", ({ chatId, userId }) => {
//       socket.to(chatId).emit("messages_read", { chatId, userId });
//     });

//     // Disconnect event
//     socket.on("disconnect", async () => {
//       if (socket.userId) {
//         // Remove from active users
//         activeUsers.delete(socket.userId);

//         // Update user status to offline with last seen time
//         await User.findByIdAndUpdate(socket.userId, {
//           status: "offline",
//           lastSeen: Date.now(),
//         });

//         // Broadcast user offline status
//         socket.broadcast.emit("user_status_changed", {
//           userId: socket.userId,
//           status: "offline",
//           lastSeen: new Date(),
//         });

//         // Broadcast to other users that this user is offline
//         socket.broadcast.emit("user_offline", socket.userId);

//         console.log("User disconnected:", socket.userId);
//       }
//     });
//   });

//   return io;
// };
import { Server } from "socket.io";
import User from "../models/user.model.js"; // ✅ Ensure ".js" extension

export const setupSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Store active users
  const activeUsers = new Map();

  io.on("connection", (socket) => {
    console.log("New client connected");

    // Setup socket with user ID
    socket.on("setup", async (userData) => {
      socket.userId = userData._id;
      socket.join(userData._id);
      activeUsers.set(userData._id, socket.id);

      // Update user status to online
      try {
        await User.findByIdAndUpdate(userData._id, { status: "online" });

        // Broadcast user online status
        socket.broadcast.emit("user_status_changed", {
          userId: userData._id,
          status: "online",
        });

        console.log("User connected:", userData._id);

        // Send list of online users to client
        const onlineUsers = Array.from(activeUsers.keys());
        socket.emit("online_users", onlineUsers);

        // Broadcast to other users that this user is online
        socket.broadcast.emit("user_online", userData._id);
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    });

    // Join a chat room
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat: ${chatId}`);
    });

    // Typing indicator
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing", { chatId, userId: socket.userId });
    });

    socket.on("stop_typing", (chatId) => {
      socket.to(chatId).emit("stop_typing", { chatId, userId: socket.userId });
    });

    // New message
    socket.on("new_message", (message) => {
      const chat = message.chat;
      if (!chat.participants) return;

      chat.participants.forEach((participant) => {
        if (participant._id === message.sender._id) return;

        // Send to user's personal room
        socket.to(participant._id).emit("message_received", message);

        // Also send to any chat room the participant is in
        socket.to(chat._id).emit("message_received", message);
      });
    });

    // Mark messages as read
    socket.on("mark_messages_read", ({ chatId, userId }) => {
      socket.to(chatId).emit("messages_read", { chatId, userId });
    });

    // Disconnect event
    socket.on("disconnect", async () => {
      if (socket.userId) {
        activeUsers.delete(socket.userId);

        try {
          await User.findByIdAndUpdate(socket.userId, {
            status: "offline",
            lastSeen: Date.now(),
          });

          socket.broadcast.emit("user_status_changed", {
            userId: socket.userId,
            status: "offline",
            lastSeen: new Date(),
          });

          socket.broadcast.emit("user_offline", socket.userId);

          console.log("User disconnected:", socket.userId);
        } catch (error) {
          console.error("Error updating user status on disconnect:", error);
        }
      }
    });
  });

  return io;
};
