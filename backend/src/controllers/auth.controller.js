import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { getRandomDefaultInterests, generateDefaultBio } from "../utils/profileDefaults.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check database connection before proceeding
    if (mongoose.connection.readyState !== 1) {
      console.warn("MongoDB not connected, attempting to reconnect...");
      try {
        await mongoose.connect(process.env.MONGO_URI);
      } catch (connError) {
        console.error("Failed to reconnect to MongoDB", connError);
        return res.status(503).json({ 
          message: "Database service unavailable, please try again later",
          error: "connection_error"
        });
      }
    }

    try {
      // Set timeout option specifically for this query
      const user = await User.findOne({ email }).maxTimeMS(15000);

      if (user) return res.status(400).json({ message: "Email already exists" });
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Set default eco-friendly interests and bio for new users
      const defaultInterests = getRandomDefaultInterests(3);
      const defaultBio = generateDefaultBio(fullName);

      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        interests: defaultInterests,
        bio: defaultBio,
      });
  
      if (newUser) {
        // generate jwt token here
        generateToken(newUser._id, res);
        
        // Set a timeout for the save operation using Promise.race
        const savePromise = newUser.save();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Save operation timed out')), 15000)
        );
        
        await Promise.race([savePromise, timeoutPromise]);
  
        res.status(201).json({
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic,
          bio: newUser.bio,
          location: newUser.location,
          interests: newUser.interests,
          ecoPoints: newUser.ecoPoints,
          followers: newUser.followers,
          following: newUser.following,
        });
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    } catch (dbError) {
      console.error("Database operation error during signup:", dbError);
      return res.status(500).json({ 
        message: "Database operation failed, please try again",
        error: "database_timeout"
      });
    }
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      location: user.location,
      interests: user.interests,
      ecoPoints: user.ecoPoints,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { 
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // This function is kept for backward compatibility
    // Now we redirect to the new updateProfile in profile controller
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profile_pics",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto:good" },
        { format: "auto" }
      ]
    });
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
