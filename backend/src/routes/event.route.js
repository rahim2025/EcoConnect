import express from "express";
import { 
  createEvent, 
  getAllEvents, 
  getUpcomingEvents, 
  getEventById, 
  joinEvent, 
  leaveEvent, 
  updateEvent, 
  deleteEvent, 
  getUserEvents,
  completeEvent,
  inviteUserToEvent 
} from "../controllers/event.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected - require authentication
router.use(protectRoute);

// Event CRUD operations
router.post("/create", createEvent);
router.get("/", getAllEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/:eventId", getEventById);
router.put("/:eventId", updateEvent);
router.delete("/:eventId", deleteEvent);

// Event participation
router.post("/:eventId/join", joinEvent);
router.post("/:eventId/leave", leaveEvent);
router.post("/:eventId/complete", completeEvent);
router.post("/:eventId/invite", inviteUserToEvent);

// User events
router.get("/user/:userId?", getUserEvents); // Optional userId parameter

export default router;
