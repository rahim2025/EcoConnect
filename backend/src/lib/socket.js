import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174",
      "https://eco-connect-l9yy.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000, // 60 seconds to consider a client disconnected if no pong received
  pingInterval: 25000, // 25 seconds between pings
  transports: ['websocket', 'polling'], // Allow both websocket and polling
  allowEIO3: true // Enable backward compatibility
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  
  // Make sure we have a valid userId before adding to online users
  if (userId) {
    console.log(`User ${userId} is now online with socket ID: ${socket.id}`);
    userSocketMap[userId] = socket.id;
    
    // Broadcast to all clients that a user has connected
    broadcastOnlineUsers();
    
    // Handle client requests for the current online users list
    socket.on("requestOnlineUsers", () => {
      // Send the current list of online users directly to the requesting socket
      socket.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`Sent online users to ${userId} upon request:`, Object.keys(userSocketMap));
    });
    
    // Listen for client-side heartbeat responses
    socket.on("heartbeat", () => {
      console.log(`Heartbeat received from user ${userId}`);
      // Make sure the user is marked as online
      userSocketMap[userId] = socket.id;
    });
  }
  
  // Send a server heartbeat every 30 seconds to verify connections
  const heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit("serverHeartbeat");
      console.log(`Sent heartbeat to user ${userId}`);
    } else {
      console.log(`User ${userId} socket disconnected - clearing heartbeat`);
      clearInterval(heartbeatInterval);
    }
  }, 30000);

  socket.on("disconnect", () => {
    if (userId) {
      console.log(`User ${userId} disconnected with socket ID: ${socket.id}`);
      
      // Double-check this is still the current socket for this user before removing
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        broadcastOnlineUsers();
      } else {
        console.log(`Ignoring disconnect for ${userId} - newer socket exists`);
      }
    } else {
      console.log("Unknown user disconnected", socket.id);
    }
    
    clearInterval(heartbeatInterval);
  });
});

// Helper function to broadcast online users to all clients
function broadcastOnlineUsers() {
  const onlineUserIds = Object.keys(userSocketMap);
  console.log("Broadcasting online users:", onlineUserIds);
  io.emit("getOnlineUsers", onlineUserIds);
}

export { io, app, server };
