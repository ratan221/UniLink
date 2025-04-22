import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { Chat } from "../models/chattingModel.js";

// ✅ Create or Access Chat
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("UserId param not sent with request");
  }

  let chat = await Chat.find({
    participants: { $all: [req.user._id, userId] },
  })
    // .populate("participants", "-password")
    .populate("participants", "name username profilePicture") // 👈 Only required fields

    .populate("latestMessage");

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "username profileImage email",
  });

  if (chat.length > 0) {
    res.json(chat[0]);
  } else {
    try {
      const createdChat = await Chat.create({
        participants: [req.user._id, userId],
      });

      const fullChat = await Chat.findById(createdChat._id).populate(
        "participants",
        "-password"
      );

      res.status(201).json(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// ✅ Fetch User's Chats
// export const fetchChats = asyncHandler(async (req, res) => {
//   try {
//     let chats = await Chat.find({ participants: req.user._id })
//       .populate("participants", "name username profilePicture") // 👈 Only required fields

//       .populate("latestMessage")
//       .sort({ updatedAt: -1 });

//     chats = await User.populate(chats, {
//       path: "latestMessage.sender",
//       select: "username profileImage email",
//     });

//     res.status(200).json(chats);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });


// export const fetchChats = asyncHandler(async (req, res) => {
//   try {
//     let chats = await Chat.find({ participants: req.user._id })
//       .populate("participants", "name username profilePicture") // 👈 Only required fields

//       .populate("latestMessage")
//       .sort({ updatedAt: -1 });

//     chats = await User.populate(chats, {
//       path: "latestMessage.sender",
//       select: "username profileImage email",
//     });

//     res.status(200).json(chats);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });


export const fetchChats = asyncHandler(async (req, res) => {
  try {
    let chats = await Chat.find({ participants: req.user._id })
      .populate("participants", "name username profilePicture")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username profileImage email",
    });

    // Add hasUnread field to each chat
    const enhancedChats = chats.map((chat) => {
      const currentUserId = req.user._id.toString();
      // Check if current user is NOT the sender of the latest message
      let hasUnread = false;

      if (chat.latestMessage) {
        const isLatestMessageFromSomeoneElse =
          chat.latestMessage.sender._id.toString() !== currentUserId;

        const isMessageUnread = !chat.latestMessage.readBy.some(
          (id) => id.toString() === currentUserId
        );

        // User has unread messages if the latest message is from someone else
        // and they haven't read it yet
        hasUnread = isLatestMessageFromSomeoneElse && isMessageUnread;
      }

      // Convert to plain object to add the new field
      const chatObj = chat.toObject();
      chatObj.hasUnread = hasUnread;

      return chatObj;
    });

    res.status(200).json(enhancedChats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
}
});



// MESSAGE CONTROLLER
// -----------------
