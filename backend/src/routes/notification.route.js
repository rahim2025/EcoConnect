import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  getAdminNotifications
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { protectAdminRoute } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.put("/:id/read", protectRoute, markAsRead);
router.put("/read-all", protectRoute, markAllAsRead);
router.delete("/:id", protectRoute, deleteNotification);
router.get("/admin", protectAdminRoute, getAdminNotifications);

export default router;
