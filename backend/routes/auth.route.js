import express from "express";
import {
  login,
  logout,
  signup,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import multer from "multer";
const upload = multer();

const router = express.Router();

router.post("/register", upload.none(), signup);
router.post("/login", upload.none(), login);
router.post("/logout", logout);

router.get(
  "/me",

  (req, res, next) => {
    protectRoute(req, res, next, ["user", "admin"]);
  },
  getCurrentUser
);

export default router;
