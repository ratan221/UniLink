import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { Chat, Message } from "../models/chattingModel.js";

// ✅ Send Message
export const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, attachments, messageType } = req.body;

  if (!content && (!attachments || attachments.length === 0)) {
    res.status(400);
    throw new Error("Message content is required");
  }

  if (!chatId) {
    res.status(400);
    throw new Error("ChatId is required");
  }

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error("You are not authorized to send messages in this chat");
  }

  const newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    readBy: [req.user._id],
    attachments: attachments || [],
    messageType: messageType || "text",
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate([
      { path: "sender", select: "username profileImage" },
      { path: "chat" },
    ]);

    message = await User.populate(message, {
      path: "chat.participants",
      select: "username profileImage email status",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    // Unread Count Update
    const otherParticipants = chat.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );

    const unreadCountUpdate = {};
    otherParticipants.forEach((participant) => {
      const participantId = participant.toString();
      const currentCount = chat.unreadCount.get(participantId) || 0;
      unreadCountUpdate[`unreadCount.${participantId}`] = currentCount + 1;
    });

    await Chat.findByIdAndUpdate(chatId, { $set: unreadCountUpdate });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    // Validate chat existence and user authorization
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this chat" });
    }

    // Fetch all messages with full details
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username email profilePicture") // Populate sender details
      .sort({ createdAt: 1 }); // Sort in ascending order to maintain conversation flow

    console.log(messages, "sssssssssss");
    // Reset unread count for this user in the chat
    await Chat.findByIdAndUpdate(chatId, {
      $set: { [`unreadCount.${req.user._id}`]: 0 },
    });

    // Mark all unread messages as "read" by the current user
    await Message.updateMany(
      { chat: chatId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
