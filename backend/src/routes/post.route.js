import express from "express";
import { 
  createPost, 
  getFeedPosts, 
  getUserPosts, 
  likePost, 
  addComment, 
  deleteComment, 
  deletePost,
  searchPosts,
  reportPost
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected - require authentication
router.use(protectRoute);

// Post creation and feed
router.post("/create", createPost);
router.get("/feed", getFeedPosts);
router.get("/user/:userId", getUserPosts);
router.get("/search", searchPosts);

// Post interactions
router.post("/:postId/like", likePost);
router.post("/:postId/comment", addComment);
router.delete("/:postId/comment/:commentId", deleteComment);
router.delete("/:postId", deletePost);
router.post("/:postId/report", reportPost);

export default router;
