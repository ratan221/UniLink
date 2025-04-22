import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createPost,
  getFeedPosts,
  deletePost,
  getPostById,
  createComment,
  likePost,
  updateComment,
  sharePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/get-feed", protectRoute, getFeedPosts); // just for now  i have get post by using post method
router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.get("/:id", protectRoute, getPostById);
router.post("/:id/comment", protectRoute, createComment);
router.put("/:postId/comments/:commentId", protectRoute, updateComment);

router.post("/:id/like", protectRoute, likePost);
router.post("/:postId/share", protectRoute, sharePost); 

export default router;
