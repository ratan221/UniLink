import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { encryptPassword } from "../services/common_utils.js";
import { readSingle } from "../database/dbFunctions.js";
import { HTTP_STATUS } from "../services/constants.js";

// export const signup = async (req, res) => {
//   try {
//     const { name, username, email, password } = req.body;

//     if (!name || !username || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ message: "Username already exists" });
//     }

//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       username,
//     });

//     await user.save();

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "3d",
//     });

//     res.cookie("jwt-linkedin", token, {
//       httpOnly: true, // prevent XSS attack
//       maxAge: 3 * 24 * 60 * 60 * 1000,
//       sameSite: "strict", // prevent CSRF attacks,
//       secure: process.env.NODE_ENV === "production", // prevents man-in-the-middle attacks
//     });

//     res.status(201).json({ message: "User registered successfully" });

//     const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

//     try {
//       await sendWelcomeEmail(user.email, user.name, profileUrl);
//     } catch (emailError) {
//       console.error("Error sending welcome Email", emailError);
//     }
//   } catch (error) {
//     console.log("Error in signup: ", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    console.log(name);

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await encryptPassword(password);

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is missing" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("jwt-linkedin", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "User registered successfully" });

    try {
      await sendWelcomeEmail(
        user.email,
        user.name,
        `${process.env.CLIENT_URL}/profile/${user.username}`
      );
    } catch (emailError) {
      console.error("Error sending welcome Email", emailError);
    }
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await readSingle(User, { email: email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch, "ssss", password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    await res.cookie("jwt-linkedin", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(HTTP_STATUS?.OK).json({
      success: true,
      message: "success",
      data: { token, user },
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwt-linkedin");
  res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const addCertificate=asyc(req,res)=>{
// try {

// } catch (error) {
//   console.log(error)
// }
// }
