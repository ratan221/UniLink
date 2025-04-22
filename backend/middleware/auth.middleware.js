import { verifyJWTToken } from "../services/common_utils.js";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next, roles = []) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided or invalid token format");
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = verifyJWTToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    if (roles.length > 0 && !roles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden - Insufficient permissions" });
    }

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
