import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { accessChat, fetchChats } from "../controllers/chatController.js";

const router = express.Router();

router.post("/get-access", protectRoute, accessChat);
router.get("/get-messages", protectRoute, fetchChats);

export default router;
