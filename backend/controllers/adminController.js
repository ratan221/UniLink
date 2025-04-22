import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { encryptPassword } from "../services/common_utils.js";
import { readMultiple, readSingle } from "../database/dbFunctions.js";
import { HTTP_STATUS } from "../services/constants.js";
import Post from "../models/post.model.js";
import Event from "../models/eventModel.js";
import mongoose from "mongoose";

export const getAllUsers = async (req, res) => {
  try {
    const users = await readMultiple(User, { role: "user" });

    if (!users.length) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPendingCertifications = async (req, res) => {
  try {
    const users = await User.find({ "certifications.0": { $exists: true } })
      .select("name email certifications skills")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching pending certifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const approveCertification = async (req, res) => {
//   try {
//     const { userId, certId } = req.params;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const cert = user.certifications.id(certId);
//     if (!cert)
//       return res.status(404).json({ message: "Certification not found" });

//     cert.isVerified = true;

//     const allCertsVerified = user.certifications.every((c) => c.isVerified);
//     user.isVerified = allCertsVerified;

//     await user.save();

//     res.json({ success: true, message: "Certification approved", user });
//   } catch (error) {
//     console.error("Error approving certification:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Approve Certification
export const approveCertification = async (req, res) => {
  try {
    const { userId, certId } = req.params;

    // Validate ObjectId format first
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(certId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid ID format" 
      });
    }

    // Use findOneAndUpdate for atomic operation
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "certifications._id": certId
      },
      {
        $set: {
          "certifications.$.status": "approved",
          "certifications.$.isVerified": true,
          // Update user verification status if all certs are now verified
          isVerified: await checkAllCertificationsVerified(userId)
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: "User or certification not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Certification approved", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error approving certification:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Helper function to check if all certifications are verified
async function checkAllCertificationsVerified(userId) {
  const user = await User.findById(userId);
  return user.certifications.every(cert => cert.isVerified);
}

// Reject Certification
export const rejectCertification = async (req, res) => {
  try {
    const { userId, certId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cert = user.certifications.id(certId);
    if (!cert)
      return res.status(404).json({ message: "Certification not found" });

    cert.status = "rejected";
    cert.isVerified = false;

    await user.save();

    res.json({ success: true, message: "Certification rejected", user });
  } catch (error) {
    console.error("Error rejecting certification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ----------------------------------------SKILLS
export const getUsersWithSkills = async (req, res) => {
  try {
    const users = await User.find({ "skills.0": { $exists: true } })
      .select("name email skills")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users with skills:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveSkill = async (req, res) => {
  try {
    const { userId, skillId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const skill = user.skills.id(skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    skill.isSkillVerified = true;
    skill.skillStatus = "approved";

    user.isSkillsVerified = true;
    await user.save();

    res.json({ success: true, message: "Skill approved", user });
  } catch (error) {
    console.error("Error approving skill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectSkill = async (req, res) => {
  try {
    const { userId, skillId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const skill = user.skills.id(skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    skill.isSkillVerified = false;
    skill.skillStatus = "rejected";
    
    user.isSkillsVerified = false;
    await user.save();

    res.json({ success: true, message: "Skill rejected", user });
  } catch (error) {
    console.error("Error rejecting skill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getUserReportByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalPosts = await Post.countDocuments({ author: userId });
    const userPosts = await Post.find({ author: userId });

    const totalComments = userPosts.reduce(
      (sum, post) => sum + (post.comments?.length || 0),
      0
    );

    const totalShares = await Post.countDocuments({
      sharedPost: { $ne: null },
      author: userId,
    });

    const totalLikes = userPosts.reduce(
      (sum, post) => sum + (post.likes?.length || 0),
      0
    );

    const totalEvents = await Event.countDocuments(); // All events in DB
    const userEvents = await Event.countDocuments({ author: userId }); // Events created by this user

    const allEvents = await Event.find(); // You can optimize this later
    const totalEventLikes = allEvents.reduce(
      (sum, event) => sum + (event.likes?.length || 0),
      0
    );
    const totalEventComments = allEvents.reduce(
      (sum, event) => sum + (event.comments?.length || 0),
      0
    );
    const totalEventShares = allEvents.reduce(
      (sum, event) => sum + (event.shares?.length || 0),
      0
    );

    res.status(200).json({
      success: true,
      user: userExists,
      data: {
        totalPosts,
        totalComments,
        totalShares,
        totalLikes,
        totalEvents,
        userEvents,
        totalEventLikes,
        totalEventComments,
        totalEventShares,
      },
    });
  } catch (error) {
    console.error("Error in getUserReportByAdmin controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const assignHeadUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "user") {
      return res
        .status(400)
        .json({ message: "Only users can be assigned as head users" });
    }

    user.userType = "head";
    await user.save();

    res.json({ success: true, message: "User assigned as head user", user });
  } catch (error) {
    console.error("Error assigning head user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUserCompletely = async (req, res) => {};
