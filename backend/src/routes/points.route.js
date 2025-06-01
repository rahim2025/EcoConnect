import express from "express";
import { getPointsSummary, getLeaderboard } from "../controllers/points.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get eco points summary for a user
router.get("/summary/:userId?", getPointsSummary);

// Get leaderboard of users with highest eco points
router.get("/leaderboard", getLeaderboard);

export default router;
