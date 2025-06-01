import express from "express";
import { getAllBadges, getUserBadges, purchaseBadge, updateDisplayBadges } from "../controllers/badge.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get all available badges
router.get("/", getAllBadges);

// Get badges owned by a user
router.get("/user/:userId?", getUserBadges);

// Purchase a badge with eco points
router.post("/purchase", purchaseBadge);

// Update display badges on profile
router.put("/display", updateDisplayBadges);

export default router;
