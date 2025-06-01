import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,  // path to badge icon
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 5,
    },
    category: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert", "special"],
      default: "beginner",
    },
    // Whether this badge is available for purchase
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // For limited time badges
    validUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
