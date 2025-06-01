import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectAdminRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Check if user has admin role
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied - Admin only" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
