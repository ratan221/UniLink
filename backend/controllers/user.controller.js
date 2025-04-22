import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import Post from "../models/post.model.js";
import Event from "../models/eventModel.js";
import ConnectionRequest from "../models/connectionRequest.model.js";
export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).select(
      "connections"
    );

    // Suggested users excluding self and already connected users
    const suggestedUsers = await User.find({
      _id: {
        $ne: currentUserId,
        $nin: currentUser.connections,
      },
    })
      .select("name username profilePicture headline")
      .limit(10);

    // Fetch all connection requests involving the current user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    });

    // Map userId => status
    const requestMap = {};

    connectionRequests.forEach((req) => {
      const otherUserId = req.sender.equals(currentUserId)
        ? req.recipient.toString()
        : req.sender.toString();

      if (req.status === "pending") {
        requestMap[otherUserId] = req.sender.equals(currentUserId)
          ? "pending"
          : "received";
      } else if (req.status === "rejected") {
        requestMap[otherUserId] = "rejected";
      }
    });

    // Final suggestions with connection status
    const suggestionsWithStatus = suggestedUsers.map((user) => {
      const status = requestMap[user._id.toString()] || "not_connected";
      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture,
        headline: user.headline,
        status,
      };
    });

    res.json(suggestionsWithStatus);
  } catch (error) {
    console.error("Error in getSuggestedConnections controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in getPublicProfile controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  console.log("guuuullllooooooooooooooooooooooo", req.body);
  try {
    const allowedFields = [
      "name",
      "username",
      "headline",
      "about",
      "location",
      "skills",
      "experience",
      "education",
      "certifications",
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }

    if (req.files?.profilePicture) {
      const file = req.files.profilePicture[0]; // Get the file
      const result = await cloudinary.uploader.upload(file.path); // Upload file
      updatedData.profilePicture = result.secure_url;
    }

    if (req.files?.bannerImg) {
      const file = req.files.bannerImg[0]; // Get the file
      const result = await cloudinary.uploader.upload(file.path); // Upload file
      updatedData.bannerImg = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addCertification = async (req, res) => {
  try {
    const { title, institute, startDate, endDate, description, file } = req.body;

    if (!title || !institute || !startDate || !endDate || !description) {
      return res.status(400).json({
        success: false,
        message: "All certification fields are required.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    let fileUrl = "";

    if (file) {
      const uploadResult = await cloudinary.uploader.upload(file, {
        folder: "certifications",
        resource_type: "auto",
      });
      fileUrl = uploadResult.secure_url;
    }

    const newCertification = {
      _id: new mongoose.Types.ObjectId(),
      title,
      institute,
      startDate,
      endDate,
      description,
      file: fileUrl,
    };

    user.certifications.push(newCertification);
    await user.save({ validateModifiedOnly: true }); // Only validate modified fields

    res.status(201).json({
      success: true,
      message: "Certification added successfully",
      data: user.certifications,
    });
  } catch (error) {
    console.error("Error in addCertification:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

export const deleteCertification = async (req, res) => {
  try {
    const { certId } = req.params;

    // Validate the certId format first
    if (!mongoose.Types.ObjectId.isValid(certId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid certification ID format" 
      });
    }

    // Find the user and update in one operation using $pull
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { certifications: { _id: certId } } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if certification was actually removed
    const certificationExists = updatedUser.certifications.some(
      cert => cert._id.toString() === certId
    );

    if (certificationExists) {
      return res.status(404).json({ 
        success: false,
        message: "Certification not found or already deleted" 
      });
    }

    res.json({
      success: true,
      message: "Certification deleted successfully",
      data: updatedUser.certifications,
    });

  } catch (error) {
    console.error("Error in deleteCertification:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation error",
        errors 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

export const addExperience = async (req, res) => {
  try {
    const { title, company, startDate, endDate, description } = req.body;

    if (!title || !company || !startDate || !endDate || !description) {
      return res.status(400).json({
        success: false,
        message: "All experience fields are required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new experience object
    const newExperience = {
      _id: new mongoose.Types.ObjectId(),
      title,
      company,
      startDate,
      endDate,
      description,
    };

    user.experience.push(newExperience);

    await user.save();

    res.json({ success: true, data: user.experience });
  } catch (error) {
    console.error("Error in addExperience:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addEducation = async (req, res) => {
  try {
    const { school, fieldOfStudy, startYear, endYear } = req.body;

    if (!school || !fieldOfStudy || !startYear) {
      return res.status(400).json({
        success: false,
        message: "School, fieldOfStudy, and startYear are required.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the education already exists
    const exists = user.education.some(
      (edu) =>
        edu.school === school &&
        edu.fieldOfStudy === fieldOfStudy &&
        edu.startYear === startYear
    );

    if (exists) {
      return res
        .status(400)
        .json({ message: `Education at ${school} already exists.` });
    }

    // Create new education entry
    const newEducation = {
      _id: new mongoose.Types.ObjectId(),
      school,
      fieldOfStudy,
      startYear,
      endYear: endYear || null,
    };

    user.education.push(newEducation);
    await user.save();

    res.json({ success: true, data: user.education });
  } catch (error) {
    console.error("Error in addEducation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ------------------------------------------------------------
export const updateCertification = async (req, res) => {
  try {
    const { certId, title, institute, startDate, endDate, description } =
      req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const certification = user.certifications.id(certId);
    if (!certification) {
      return res.status(404).json({ message: "Certification not found" });
    }

    certification.title = title || certification.title;
    certification.institute = institute || certification.institute;
    certification.startDate = startDate || certification.startDate;
    certification.endDate = endDate || certification.endDate;
    certification.description = description || certification.description;

    await user.save();
    res.json({ success: true, data: user.certifications });
  } catch (error) {
    console.error("Error in updateCertification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { expId, title, company, startDate, endDate, description } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const experience = user.experience.id(expId);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    experience.title = title || experience.title;
    experience.company = company || experience.company;
    experience.startDate = startDate || experience.startDate;
    experience.endDate = endDate || experience.endDate;
    experience.description = description || experience.description;

    await user.save();
    res.json({ success: true, data: user.experience });
  } catch (error) {
    console.error("Error in updateExperience:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { eduId, school, fieldOfStudy, startYear, endYear } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const education = user.education.id(eduId);
    if (!education) {
      return res.status(404).json({ message: "Education not found" });
    }

    education.school = school || education.school;
    education.fieldOfStudy = fieldOfStudy || education.fieldOfStudy;
    education.startYear = startYear || education.startYear;
    education.endYear = endYear || education.endYear;

    await user.save();
    res.json({ success: true, data: user.education });
  } catch (error) {
    console.error("Error in updateEducation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Skills
export const getSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("skills");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, data: user.skills });
  } catch (error) {
    console.error("Error in getSkills:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Add a Skill
export const addSkill = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    console.log(name,'fffffffffffffffffffffffffff')
    if (!name) {
      return res.status(400).json({ message: "Skill name is required." });
    }

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    console.log(imageUrl, "SKILL-ADD-IMAGE-URL");

    const skill = {
      // _id: new mongoose.Types.ObjectId(),
      name,
      description,
      isSkillVerified: false,
      image: imageUrl,
      skillStatus: "pending",
    };

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.skills.push(skill);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Skill added successfully.",
      data: skill,
    });
  } catch (error) {
    console.error("Error in addSkill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { skillId, name, description, image } = req.body;

    // Find user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find skill by ID
    const skill = user.skills.id(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Update fields if provided
    skill.name = name || skill.name;
    skill.description = description || skill.description;
    // skill.isSkillVerified =
    //   typeof isSkillVerified === "boolean"
    //     ? isSkillVerified
    //     : skill.isSkillVerified;

    // Handle image upload if a new one is provided
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "skills",
        resource_type: "auto", // Automatically detect the resource type
      });
      skill.image = uploadResult.secure_url; // Update the image URL
    }

    // Save the user with the updated skill
    await user.save();

    // Respond with the updated skills
    res.json({ success: true, data: user.skills });
  } catch (error) {
    console.error("Error in updateSkill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.body;

    // Find the user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the skill to delete
    const skillIndex = user.skills.findIndex(
      (skill) => skill._id.toString() === skillId
    );
    if (skillIndex === -1) {
      return res.status(404).json({ message: "Skill not found." });
    }

    // Remove the skill from the user's skills array
    user.skills.splice(skillIndex, 1); // Removes the skill at the specified index

    // Save the updated user document
    await user.save();

    // Send success response
    res.json({ success: true, message: "Skill deleted", data: user.skills });
  } catch (error) {
    console.error("Error in deleteSkill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------------------------------------------------


export const searchUsers = async (req, res) => {
  const query = req.query.q;

  try {
    const users = await User.find({
      username: { $regex: "^" + query, $options: "i" }, // case-insensitive, starts with
    }).select("username _id"); // only return username and _id

    res.json(users);
  } catch (error) {
    console.error("Error in searchUsers controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// export const getUserReport = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     console.log(userId, "UUSSSEERRR-IIDD");

//     const totalPosts = await Post.countDocuments({ author: userId });

//     const userPosts = await Post.find({ author: userId });
//     const totalComments = userPosts.reduce(
//       (sum, post) => sum + post.comments.length,
//       0
//     );

//     const totalShares = await Post.countDocuments({
//       sharedPost: { $ne: null },
//       author: userId,
//     });

//     const totalLikes = userPosts.reduce(
//       (sum, post) => sum + post.likes.length,
//       0
//     );

//     const totalEvents = await Event.countDocuments();
//     const userEvents = await Event.countDocuments({ author: userId });

//     res.status(200).json({
//       success: true,
//       data: {
//         totalPosts,
//         totalComments,
//         totalShares,
//         totalLikes,
//         totalEvents,
//         userEvents,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getUserReport controller:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getUserReport = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId, "UUSSSEERRR-IIDD");
const userProfile=await User.findById(userId)
if(!userProfile){
  return res.status(404).json({ message: "User not found" });
}
    // 🟢 Total Posts & Related Stats
    const totalPosts = await Post.countDocuments({ author: userId });
    const userPosts = await Post.find({ author: userId });
    const totalComments = userPosts.reduce(
      (sum, post) => sum + post.comments.length,
      0
    );
    const totalShares = await Post.countDocuments({
      sharedPost: { $ne: null },
      author: userId,
    });
    const totalLikes = userPosts.reduce(
      (sum, post) => sum + post.likes.length,
      0
    );

    // 🟢 Total Events & Related Stats
    const totalEvents = await Event.countDocuments();
    const userEvents = await Event.countDocuments({ author: userId });

    // 🟢 Total Likes, Comments & Shares on Events
    const allEvents = await Event.find();
    const totalEventLikes = allEvents.reduce(
      (sum, event) => sum + (event.likes ? event.likes.length : 0),
      0
    );
    const totalEventComments = allEvents.reduce(
      (sum, event) => sum + (event.comments ? event.comments.length : 0),
      0
    );
    const totalEventShares = allEvents.reduce(
      (sum, event) => sum + (event.shares ? event.shares.length : 0),
      0
    );
    
    res.status(200).json({
      success: true,
      user:userProfile,
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
    console.error("Error in getUserReport controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

