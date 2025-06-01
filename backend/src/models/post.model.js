import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true
  },
}, { timestamps: true });

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    tags: [{
      type: String,
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    comments: [commentSchema],    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },
    reports: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reason: {
        type: String,
        required: true,
        enum: ["inappropriate", "spam", "harmful", "misinformation", "other"]
      },
      details: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ["pending", "reviewed", "dismissed"],
        default: "pending"
      }
    }],
    isHidden: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
