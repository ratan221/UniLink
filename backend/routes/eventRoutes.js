import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createEvent,
  createEventComment,
  deleteEvent,
  getAllEvents,
  likeEvent,
  shareEvent,
  updateEvent,
  updateEventComment,
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/get-list", protectRoute, getAllEvents); //post sy get kia hy

router.post("/create", protectRoute, createEvent);
router.put("/:eventId", protectRoute, updateEvent);

router.delete("/delete/:eventId", protectRoute, deleteEvent);
router.post("/:eventId/like", protectRoute, likeEvent);
router.post("/:eventId/comment", protectRoute, createEventComment);
router.put("/:eventId/comment/:commentId", protectRoute, updateEventComment);
router.post("/:eventId/share", protectRoute, shareEvent);

export default router;
//67e89a4407d6f57454b66000
