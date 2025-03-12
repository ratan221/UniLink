import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../email/emailHandlers.js";

export const signup = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Ensure the email belongs to @srmap.edu.in domain
        if (!email.endsWith("@srmap.edu.in")) {
            return res.status(400).json({ message: "Only @srmap.edu.in emails are allowed to sign up" });
        }

        // Check if email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: "Email already exists" });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: "Username already exists" });
            }
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword
        });

        // Generate JWT Token
        const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

        // Set token as a cookie
        res.cookie("jwt-UniLink", token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
            sameSite: "Strict",
            secure: process.env.NODE_ENV === "production", // Corrected from MODE_ENV
        });
        res.status(201).json({ message: "User registered successfully" });
        
        

        const profileUrl = "process.env.CLIENT_URL" + "/profile/" + user.username;
        try{
            await sendWelcomeEmail(user.email,user.name,profileUrl)

        } catch(emailError){
            console.error("Error sending welcome email:",emailError);
            }

    } catch (error) {
        console.error("❌ Error in signup:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Create and send token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
		await res.cookie("jwt-UniLink", token, {
			httpOnly: true,
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});

		res.json({ message: "Logged in successfully" });
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};


export const logout = (req, res) => {
	res.clearCookie("jwt-UniLink");
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
