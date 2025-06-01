import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    isDisplayed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure each user can have a badge only once
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

const UserBadge = mongoose.model("UserBadge", userBadgeSchema);

export default UserBadge;
