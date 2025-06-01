import express from 'express';
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
