import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
    // Fetch all notifications for the current user
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/notifications");
      set({ 
        notifications: res.data,
        unreadCount: res.data.filter(notification => !notification.isRead).length
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Comment out error toast to prevent persistent errors until backend is restarted
      // toast.error("Failed to load notifications");
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      set(state => {
        const updatedNotifications = state.notifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        );
        
        return { 
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.isRead).length
        };
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  },
  
  // Add a new notification (for socket events)
  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },
  
  // Remove a notification by ID
  removeNotification: async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      set(state => {
        const updatedNotifications = state.notifications.filter(
          n => n._id !== notificationId
        );
        return { 
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.isRead).length
        };
      });
    } catch (error) {
      console.error("Error removing notification:", error);
      toast.error("Failed to remove notification");
    }
  },
    // Create a mock follow notification (for testing until backend is implemented)
  createMockFollowNotification: (follower) => {
    const mockNotification = {
      _id: Date.now().toString(),
      type: 'follow',
      sender: follower,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      notifications: [mockNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
    
    return mockNotification;
  },
  
  // Add a notification to the store (used for real-time notifications)
  addNotification: (notification) => {
    set(state => {
      // Check if notification already exists to prevent duplicates
      const exists = state.notifications.some(n => n._id === notification._id);
      if (exists) return state;
      
      const updatedNotifications = [notification, ...state.notifications];
      
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length
      };
    });
  }
}));
