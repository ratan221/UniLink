// import express from "express";
// import { protectRoute } from "../middleware/auth.middleware.js";
// import {
//   getSuggestedConnections,
//   getPublicProfile,
//   updateProfile,
// } from "../controllers/user.controller.js";
// import multer from "multer";
// const upload = multer();
// const router = express.Router();

// router.get("/suggestions", protectRoute, getSuggestedConnections);
// router.get("/:username", protectRoute, getPublicProfile);

// router.put("/update-profile", upload.none(), protectRoute, updateProfile);

// export default router;
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getSuggestedConnections,
  getPublicProfile,
  updateProfile,
  addExperience,
  addCertification,
  addEducation,
  getUserReport,
  updateCertification,
  updateExperience,
  updateEducation,
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  searchUsers,
  deleteCertification,
} from "../controllers/user.controller.js";
import upload from "../Configurations/upload.js";

const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/:username", protectRoute, getPublicProfile);

router.put(
  "/update-profile",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bannerImg", maxCount: 1 },
  ]),
  protectRoute,
  updateProfile
);
router.post(
  "/add-certification",
  protectRoute,
  upload.single("file"),
  addCertification
);

router.post("/add-experience", protectRoute, addExperience);
router.post("/add-education", protectRoute, addEducation);
router.put("/update-certification", protectRoute, updateCertification);
router.delete("/delete-certification/:certId", protectRoute, deleteCertification);
router.put("/update-experience", protectRoute, updateExperience);
router.put("/update-education", protectRoute, updateEducation);
router.get("/skills", protectRoute, getSkills); // ✅ Get all skills
router.post("/skills", protectRoute, addSkill); // ✅ Add a skill
router.put("/skills", protectRoute, updateSkill); // ✅ Update a skill
router.delete("/skills", protectRoute, deleteSkill); // ✅ Delete a skill
router.post("/search-users", searchUsers);

router.post(
  "/my-report",
  (req, res, next) => {
    protectRoute(req, res, next, ["user"]);
  },
  getUserReport
);
// GET METHOD IS NOT WORKING BUT BY USING POST REPORT GET SUCCESSFULLY WILL CHECK THIS ISSUE IN THE END HASSSAN BETA

export default router;
