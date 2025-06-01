import mongoose from "mongoose";

let cachedConnection = null;

export const connectDB = async () => {
  if (cachedConnection) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Configure connection options with better timeout handling
    const options = {
      serverSelectionTimeoutMS: 30000, // Timeout for server selection
      socketTimeoutMS: 45000,         // How long a socket can be idle before closing
      connectTimeoutMS: 30000,        // TCP Connection timeout
      maxPoolSize: 10,                // Maximum number of connections in the pool
      minPoolSize: 1,                // Minimum number of connections in the pool
      retryWrites: true,
      retryReads: true,
      serverApi: {
        version: '1',                // Using ServerApiVersion.v1
        strict: true,
        deprecationErrors: true
      }
    };

    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    // Cache the connection
    cachedConnection = conn;
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      cachedConnection = null; // Clear cache so we attempt reconnection next time
    });

    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error; // Re-throw so the promise can be caught by the caller
  }
};
