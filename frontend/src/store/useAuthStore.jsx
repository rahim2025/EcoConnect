import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNotificationStore } from "./useNotificationStore";
import { usePointsStore } from "./usePointsStore";
import { useBadgeStore } from "./useBadgeStore";
import { startTitleNotification, stopTitleNotification } from "../utils/titleNotification.js";
import { MessageSquare } from "lucide-react"; // Import MessageSquare icon

const BASE_URL = "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  
  isAdmin: () => {
    const { authUser } = get();
    return authUser && authUser.isAdmin === true;
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      
      // Update localStorage with latest user data
      localStorage.setItem("user-info", JSON.stringify(res.data));
      
      // Request notification permissions
      get().requestNotificationPermission();
      
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
      
      // Clear localStorage if auth check fails
      localStorage.removeItem("user-info");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Request permission for browser notifications
  requestNotificationPermission: () => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      try {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted');
          }
        });
      } catch (err) {
        console.log('Error requesting notification permission:', err);
      }
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      
      // Save user info to localStorage for persistence
      localStorage.setItem("user-info", JSON.stringify(res.data));
      
      // Request notification permission
      get().requestNotificationPermission();
      
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      
      // Clear user info from localStorage
      localStorage.removeItem("user-info");
      
      // Clear points data
      usePointsStore.getState().clearPointsData();
      
      // Clear badge data
      useBadgeStore.getState().clearBadgeData();
      
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/profile/update", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  
  // Add a method to directly set the user state
  setUser: (userData) => {
    set({ authUser: userData });
  },
  
  followUser: async (userId) => {
    try {
      console.log(`Attempting to follow user with ID: ${userId}`);
      
      // Get user info before following to create notification
      const userRes = await axiosInstance.get(`/profile/${userId}`);
      console.log("Retrieved user profile for following:", userRes.data.fullName);
      
      // Follow the user
      const followResponse = await axiosInstance.post(`/profile/follow/${userId}`);
      console.log("Follow response:", followResponse.data);
      toast.success("User followed successfully");
      
      // Update local state with updated user data
      const res = await axiosInstance.get("/profile/me");
      set({ authUser: res.data });
      
      // Create a notification for the user being followed
      // In a real implementation, this would be handled by the backend
      // But for now, we'll use a mock notification for demonstration
      if (userRes.data) {
        useNotificationStore.getState().createMockFollowNotification(res.data);
      }
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to follow user");
      return false;
    }
  },
  
  unfollowUser: async (userId) => {
    try {
      console.log(`Attempting to unfollow user with ID: ${userId}`);
      
      // Unfollow the user
      const unfollowResponse = await axiosInstance.post(`/profile/unfollow/${userId}`);
      console.log("Unfollow response:", unfollowResponse.data);
      toast.success("User unfollowed successfully");
      
      // Update local state with updated user data
      const res = await axiosInstance.get("/profile/me");
      set({ authUser: res.data });
      return true;
    } catch (error) {
      console.error("Error unfollowing user:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to unfollow user");
      return false;
    }
  },
  
  getFollowers: async () => {
    try {
      const res = await axiosInstance.get("/profile/followers");
      return res.data;
    } catch (error) {
      toast.error("Failed to fetch followers");
      return [];
    }
  },
  
  getFollowing: async () => {
    try {
      const res = await axiosInstance.get("/profile/following");
      return res.data;
    } catch (error) {
      toast.error("Failed to fetch following");
      return [];
    }
  },
  
  searchUsers: async (query) => {
    try {
      console.log(`Searching users with query: "${query}"`);
      const searchQuery = query || ""; // Ensure we pass empty string instead of undefined
      
      const res = await axiosInstance.get(`/profile/search?query=${encodeURIComponent(searchQuery)}`);
      console.log(`Found ${res.data.length} users in search results`);
      
      // Log results for debugging
      if (res.data.length > 0) {
        console.log("Users found:");
        res.data.forEach(user => {
          console.log(`- ${user._id} (${user.fullName})`);
        });
      }
      
      return res.data;
    } catch (error) {
      console.error("Error searching users:", error);
      // Comment out error toast to prevent persistent errors
      // toast.error("Failed to search users");
      return [];
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) {
      console.log("Cannot connect socket: No authenticated user");
      return;
    }
    
    // If there's already a connected socket, disconnect it first
    const existingSocket = get().socket;
    if (existingSocket) {
      console.log("Disconnecting existing socket before creating new connection");
      existingSocket.disconnect();
    }

    console.log(`Connecting socket for user: ${authUser._id}`);
    
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    // Connect explicitly
    socket.connect();

    // Set the socket in state once connected
    socket.on("connect", () => {
      console.log(`Socket connected successfully with ID: ${socket.id}`);
      set({ socket: socket });
      
      // Immediately request online users after connection
      socket.emit("requestOnlineUsers");
    });
    
    // Connection error handling
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection error. Please check your internet connection.");
    });
    
    // Handle reconnection
    socket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      // Refresh online users after reconnection
      socket.emit("requestOnlineUsers");
    });
    
    // Handle reconnection failure
    socket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed");
      toast.error("Unable to connect to the server. Please refresh the page.");
    });

    socket.on("getOnlineUsers", (userIds) => {
      console.log("Received online users:", userIds);
      set({ onlineUsers: userIds });
    });
    
    // Listen for follow notifications
    socket.on("newFollower", (data) => {
      // Add notification to store
      useNotificationStore.getState().addNotification({
        _id: data._id || Date.now().toString(),
        type: 'follow',
        sender: data.follower,
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString()
      });
      
      // Show toast notification
      toast.success(`${data.follower.fullName} started following you`);
    });
    
    // Listen for like notifications
    socket.on("newLike", (data) => {
      // Add notification to store
      useNotificationStore.getState().addNotification({
        _id: data._id,
        type: 'like',
        sender: data.sender,
        post: data.post,
        isRead: false,
        createdAt: data.createdAt
      });
      
      // Show toast notification
      toast.success(`${data.sender.fullName} liked your post`);
    });
    
    // Listen for comment notifications
    socket.on("newComment", (data) => {
      // Add notification to store
      useNotificationStore.getState().addNotification({
        _id: data._id,
        type: 'comment',
        sender: data.sender,
        post: data.post,
        comment: data.comment,
        isRead: false,
        createdAt: data.createdAt
      });
      
      // Show toast notification
      toast.success(`${data.sender.fullName} commented on your post`);
    });
    
    // Listen for event invite notifications
    socket.on("newEventInvite", (data) => {
      // Add notification to store
      useNotificationStore.getState().addNotification({
        _id: data._id,
        type: 'event_invite',
        sender: data.sender,
        event: data.event,
        content: data.content,
        isRead: false,
        createdAt: data.createdAt
      });
      
      // Show toast notification
      toast.success(`${data.sender.fullName} invited you to an event`);
    });

    // Listen for marketplace offer notifications
    socket.on("newMarketplaceOffer", (data) => {
      // Add notification to store
      useNotificationStore.getState().addNotification({
        _id: data._id,
        type: 'marketplace_offer',
        sender: data.sender,
        marketplaceItem: data.marketplaceItem,
        message: data.message,
        isRead: false,
        createdAt: data.createdAt
      });
      
      // Show toast notification
      toast.success(`${data.sender.fullName} made an offer of $${data.amount} on your listing`);
    });
    
    // Listen for chat notifications
    socket.on("newChatNotification", (data) => {
      const { message, sender } = data;
      
      // Only show notification if we're not currently in a chat with this user
      const chatStore = useChatStore.getState();
      const selectedUserId = chatStore.selectedUser?._id;
      
      if (!selectedUserId || selectedUserId !== sender._id) {
        // Show browser notification if permission is granted
        if (Notification.permission === 'granted') {
          try {
            const messageText = message.text || (message.image ? 'Sent you an image' : 'New message');
            const notification = new Notification('New message from ' + sender.fullName, {
              body: messageText,
              icon: sender.profilePic || '/avatar.png',
              badge: '/vite.svg'
            });
            
            // Navigate to chat when notification is clicked
            notification.onclick = function() {
              window.focus();
              chatStore.setSelectedUser(sender);
              window.location.href = '/chat';
            };
          } catch (err) {
            console.log("Could not display browser notification:", err);
          }
        } else if (Notification.permission !== 'denied') {
          // Request permission for notifications if not granted yet
          Notification.requestPermission();
        }
        
        // Show toast notification
        toast(
          <div className="flex items-center gap-2">
            <img 
              src={sender.profilePic || "/avatar.png"} 
              alt={sender.fullName} 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <div>
              <p className="font-medium">{sender.fullName}</p>
              <p className="text-sm truncate">{message.text || 'Sent you an image'}</p>
            </div>
          </div>,
          {
            icon: <MessageSquare className="w-5 h-5 text-primary" />,
            duration: 5000,
            onClick: () => {
              // Navigate to chat with this user when clicked
              chatStore.setSelectedUser(sender);
              window.location.href = '/chat';
            }
          }
        );
        
        // Update unread count and user list
        chatStore.getUnreadMessagesCount();
        chatStore.getUsers();
        
        // Start title notification to alert user in browser tab
        startTitleNotification("New message");
      }
    });
    
    // Listen for badge purchase notifications
    socket.on("newBadgePurchase", (data) => {
      // Add notification to store
      useNotificationStore.getState().addNotification({
        _id: data._id,
        type: 'badge_purchase',
        content: data.content,
        badgeName: data.badgeName,
        badgeImage: data.badgeImage,
        isSystemNotification: data.isSystemNotification,
        isRead: false,
        createdAt: data.createdAt
      });
      
      // Show toast notification
      toast.success(`You purchased the ${data.badgeName} badge!`, {
        icon: '🏆'
      });
    });
    
    // Listen for admin alerts
    socket.on("newAdminAlert", (data) => {
      // Add notification to store
      useNotificationStore.getState().addNotification({
        _id: data._id,
        type: data.type,
        content: data.content,
        isSystemNotification: data.isSystemNotification,
        isRead: false,
        createdAt: data.createdAt
      });
      
      // Show toast notification with appropriate style based on alert type
      const alertMessage = data.content || "New admin alert";
      
      if (data.type === 'warning') {
        toast.error(alertMessage);
      } else if (data.type === 'critical') {
        toast.error(alertMessage, { duration: 5000 });
      } else if (data.type === 'info') {
        toast.success(alertMessage);
      } else {
        toast(alertMessage); 
      }
    });
    
    // Respond to server heartbeat to confirm connection
    socket.on("serverHeartbeat", () => {
      console.log("Received heartbeat from server, responding...");
      socket.emit("heartbeat");
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
