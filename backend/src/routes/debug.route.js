import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

// Simple endpoint to test CORS
router.get("/cors-test", (req, res) => {
  console.log("CORS test endpoint reached");
  console.log("Request headers:", req.headers);
  
  res.json({
    message: "CORS test successful!",
    receivedOrigin: req.headers.origin,
    time: new Date().toISOString(),
    env: {
      CLIENT_URL: process.env.CLIENT_URL,
      NODE_ENV: process.env.NODE_ENV
    }
  });
});

// Test JWT authentication
router.get("/auth-test", (req, res) => {
  console.log("Auth test endpoint reached");
  console.log("Cookies received:", req.cookies);
  console.log("Authorization header:", req.headers.authorization);
  
  res.json({
    message: "Auth test endpoint reached",
    cookies: req.cookies,
    hasJwtCookie: !!req.cookies.jwt,
    time: new Date().toISOString()
  });
});

// Test protected route
router.get("/protected-test", protectRoute, (req, res) => {
  res.json({
    message: "Protected route access successful!",
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email
    },
    time: new Date().toISOString()
  });
});

// Test preflight handling specifically
router.options("/preflight-test", (req, res) => {
  console.log("OPTIONS preflight test received");
  res.status(200).end();
});

router.get("/preflight-test", (req, res) => {
  res.json({
    message: "If you see this, preflight worked correctly",
    time: new Date().toISOString()
  });
});

export default router;
