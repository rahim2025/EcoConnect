import express from "express";
import { 
  seedBadges, 
  getDashboardStats, 
  createBadge, 
  getAllUsers,
  updateUserPoints,
  sendUserAlert,
  getReportedPosts,
  reviewReportedPost,
  getAllEvents,
  updateEventStatus,
  getAllRewards,
  createReward,
  updateReward,
  deleteReward
} from "../controllers/admin.controller.js";
import { protectAdminRoute } from "../middleware/admin.middleware.js";
import {
  getUserDiagnostics,
  checkSpecificUser
} from "../controllers/userDiagnostic.controller.js";

const router = express.Router();

// Dashboard stats
router.get("/dashboard-stats", protectAdminRoute, getDashboardStats);

// Badge management
router.post("/badge", protectAdminRoute, createBadge);
router.post("/seed-badges", protectAdminRoute, seedBadges);

// User management
router.get("/users", protectAdminRoute, getAllUsers);
router.put("/user-points", protectAdminRoute, updateUserPoints);
router.post("/send-alert", protectAdminRoute, sendUserAlert);

// Reported posts management
router.get("/reported-posts", protectAdminRoute, getReportedPosts);
router.post("/reported-posts/:postId/review", protectAdminRoute, reviewReportedPost);

// Event management
router.get("/events", protectAdminRoute, getAllEvents);
router.put("/events/:eventId/status", protectAdminRoute, updateEventStatus);

// Rewards management
router.get("/rewards", protectAdminRoute, getAllRewards);
router.post("/rewards", protectAdminRoute, createReward);
router.put("/rewards/:rewardId", protectAdminRoute, updateReward);
router.delete("/rewards/:rewardId", protectAdminRoute, deleteReward);

// User diagnostics and troubleshooting
router.get("/user-diagnostics", protectAdminRoute, getUserDiagnostics);
router.get("/check-user/:userId", protectAdminRoute, checkSpecificUser);

export default router;
