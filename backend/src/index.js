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
import debugRoutes from "./routes/debug.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: '50mb' }));  // Increased limit for image upload
app.use(cookieParser());

// Use standard CORS middleware first with permissive settings
app.use(cors({
  origin: function(origin, callback) {
    console.log(`Standard CORS check - Origin: ${origin}`);
    // Always allow the Vercel frontend
    if (!origin || origin === 'https://eco-connect-l9yy.vercel.app') {
      callback(null, true);
    } else {
      // Also check environment variable
      const allowedOrigins = process.env.CLIENT_URL ? 
        process.env.CLIENT_URL.split(',').map(url => url.trim()) : 
        [
          "http://localhost:5173", 
          "http://localhost:5174",
          "https://eco-connect-l9yy.vercel.app"
        ];
      
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        // Allow anyway in production to be permissive - we can tighten this later
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Important! Some legacy browsers choke on 204
}));

// Then add an explicit OPTIONS handler to ensure preflight requests always succeed
app.options('*', (req, res) => {
  console.log('Handling OPTIONS preflight request explicitly');
  
  const origin = req.headers.origin;
  // Must use specific origin with credentials, not wildcard
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // Don't set credentials with wildcard
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.status(200).send('OK');
});

// Add debug routes for easier CORS testing
app.use("/api/debug", debugRoutes);

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

// Simple root level CORS test route that doesn't need auth
app.get("/cors-test", (req, res) => {
  res.json({
    message: "Root level CORS test successful",
    origin: req.headers.origin || "No origin header",
    time: new Date().toISOString()
  });
});

// Handle OPTIONS at the root level explicitly
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  
  // We must specify an exact origin when credentials are 'include'
  // Cannot use wildcard '*' with credentials
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // No origin header, don't set credentials
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-Type,Date,X-Api-Version,Origin,Authorization,Cookie');
  
  // Only set Allow-Credentials when we have a specific origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(200).end();
});

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// Immediately connect to database
connectDB().then(() => {
  console.log('MongoDB connected successfully');
  
  // Only start the server when we're not in serverless mode
  if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
      console.log(`Server is running on PORT:${PORT}`);
    });
  } else {
    console.log('Running in serverless mode - not starting server');
  }
}).catch(err => {
  console.error("Failed to connect to database:", err);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// For Vercel, we need to export a function or server
// This must be a default export
export default app;

// Also export the app and server objects for local development
export { app, server };