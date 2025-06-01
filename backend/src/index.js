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

// Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`CORS check - Origin: ${origin}`);
      console.log(`CLIENT_URL env var: ${process.env.CLIENT_URL}`);
      
      const allowedOrigins = process.env.CLIENT_URL ? 
        process.env.CLIENT_URL.split(',').map(url => url.trim()) : 
        [
          "http://localhost:5173", 
          "http://localhost:5174",
          "https://eco-connect-l9yy.vercel.app" // Fallback for your frontend
        ];
      
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) {
        console.log('No origin - allowing request');
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        console.log(`Origin ${origin} is allowed`);
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Cookie', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false,
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

// Debug endpoint to check environment variables (remove after debugging)
app.get("/api/debug/env", (req, res) => {
  res.json({
    CLIENT_URL: process.env.CLIENT_URL,
    NODE_ENV: process.env.NODE_ENV,
    hasJWT: !!process.env.JWT_SECRET,
    hasMongo: !!process.env.MONGO_URI
  });
});

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