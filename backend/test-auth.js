import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// Set NODE_ENV for testing
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = '123456789';

app.use(express.json());
app.use(cookieParser());

// CORS configuration for testing
app.use(cors({
  origin: ['https://eco-connect-l9yy.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Test JWT cookie generation
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site in production
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
  });

  return token;
};

// Test login endpoint
app.post('/api/test-login', (req, res) => {
  const testUserId = '507f1f77bcf86cd799439011';
  generateToken(testUserId, res);
  
  res.json({
    message: 'Test login successful',
    userId: testUserId,
    cookieSettings: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true
    }
  });
});

// Test protected endpoint
app.get('/api/test-protected', (req, res) => {
  console.log('Cookies received:', req.cookies);
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ message: "No Token Provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ 
      message: 'Protected endpoint access successful',
      userId: decoded.userId 
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test the cookie settings with:');
  console.log(`1. POST http://localhost:${PORT}/api/test-login`);
  console.log(`2. GET http://localhost:${PORT}/api/test-protected`);
  console.log('NODE_ENV:', process.env.NODE_ENV);
});
