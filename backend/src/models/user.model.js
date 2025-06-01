import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // New profile fields
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    interests: [{
      type: String,
    }],
    ecoPoints: {
      type: Number,
      default: 0,
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // For displaying selected badges on user profile
    displayBadges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
    }],
    // Admin flag to control access to admin dashboard
    isAdmin: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
