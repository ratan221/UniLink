import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

router.post("/send-message", protectRoute, sendMessage);
router.get("/:chatId", protectRoute, getMessages);

export default router;
