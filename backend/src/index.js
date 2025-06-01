import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

// Import models to ensure they are registered with mongoose
import "./models/user.model.js";
import "./models/post.model.js";
import "./models/badge.model.js";
import "./models/event.model.js";
import "./models/reward.model.js";
import "./models/notification.model.js";
import "./models/userBadge.model.js";
import "./models/message.model.js";
import "./models/marketplaceItem.model.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import profileRoutes from "./routes/profile.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import eventRoutes from "./routes/event.route.js";
import pointsRoutes from "./routes/points.route.js";
import badgeRoutes from "./routes/badge.route.js";
import adminRoutes from "./routes/admin.route.js";
import marketplaceRoutes from "./routes/marketplace.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: '50mb' }));  // Increased limit for image upload
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// Connect to database before starting server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`server is running on PORT:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});