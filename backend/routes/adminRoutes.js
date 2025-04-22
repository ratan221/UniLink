import { Router } from "express";
import {
  approveCertification,
  approveSkill,
  assignHeadUser,
  deleteUserCompletely,
  getAllUsers,
  getPendingCertifications,
  getUserReportByAdmin,
  getUsersWithSkills,
  rejectCertification,
  rejectSkill,
} from "../controllers/adminController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const adminRouter = Router();

adminRouter.get(
  "/all-users",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  getAllUsers
);

adminRouter.get(
  "/certifications/pending",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  getPendingCertifications
);

adminRouter.put(
  "/certifications/approve/:userId/:certId",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  approveCertification
);
adminRouter.delete(
  "/certifications/reject/:certId",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  rejectCertification
)
adminRouter.get(
  "/skills/pending",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  getUsersWithSkills
);
adminRouter.put(
  "/skills/approve/:userId/:skillId",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  approveSkill
);
adminRouter.put(
  "/skills/reject/:userId/:skillId",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  rejectSkill
);
adminRouter.get(
  "/user-report/:userId",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  getUserReportByAdmin
);
adminRouter.put(
  "/assign-head/:userId",
  (req, res, next) => {
    protectRoute(req, res, next, ["admin"]);
  },
  assignHeadUser
);

adminRouter.delete("/delete/:userId", protectRoute, deleteUserCompletely);


// getUserReportByAdmin
export default adminRouter;
