import express from "express";
import { 
  updateProfile, 
  getProfile, 
  followUser, 
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  updateEcoPoints
} from "../controllers/profile.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", protectRoute, getProfile);
router.put("/update", protectRoute, updateProfile);
router.post("/follow/:id", protectRoute, followUser);
router.post("/unfollow/:id", protectRoute, unfollowUser);
router.get("/followers", protectRoute, getFollowers);
router.get("/following", protectRoute, getFollowing);
router.get("/search", protectRoute, searchUsers);
router.put("/eco-points", protectRoute, updateEcoPoints);
router.get("/:id", protectRoute, getProfile);

export default router;
