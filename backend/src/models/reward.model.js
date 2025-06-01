import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    pointCost: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      enum: ["merchandise", "discount", "experience", "donation", "other"],
      default: "other"
    },
    image: {
      type: String,
      default: ""
    },
    available: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    redemptions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      redeemedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending"
      }
    }],
    expiresAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);

export default Reward;
