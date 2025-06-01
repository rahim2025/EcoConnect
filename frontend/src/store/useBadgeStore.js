import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.jsx";
import { usePointsStore } from "./usePointsStore";

export const useBadgeStore = create((set, get) => ({
  availableBadges: [],
  userBadges: [],
  displayBadges: [],
  loading: false,
  error: null,
  
  // Get all available badges
  getAvailableBadges: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/badges");
      set({ availableBadges: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching available badges:", error);
      toast.error("Failed to load available badges");
      set({ error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  // Get badges owned by a user
  getUserBadges: async (userId = null) => {
    set({ loading: true });
    try {
      const endpoint = userId ? `/badges/user/${userId}` : "/badges/user";
      const res = await axiosInstance.get(endpoint);
      set({ userBadges: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching user badges:", error);
      toast.error("Failed to load user badges");
      set({ error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },
    // Purchase a badge using eco points
  purchaseBadge: async (badgeId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/badges/purchase", { badgeId });
      
      // Update user badges
      await get().getUserBadges();
      
      // Update auth user with new point balance
      const authUser = useAuthStore.getState().authUser;
      if (authUser) {
        authUser.ecoPoints = res.data.remainingPoints;
        useAuthStore.setState({ authUser });
        
        // Also refresh points summary
        usePointsStore.getState().getPointsSummary();
      }
      
      // Show success message
      toast.success(res.data.message);
      
      return res.data;
    } catch (error) {
      console.error("Error purchasing badge:", error);
      toast.error(error.response?.data?.message || "Failed to purchase badge");
      set({ error: error.response?.data?.message || error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  // Update which badges to display on profile
  updateDisplayBadges: async (badgeIds) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put("/badges/display", { badgeIds });
      
      set({ displayBadges: res.data.displayBadges });
      toast.success("Display badges updated successfully");
      
      return res.data.displayBadges;
    } catch (error) {
      console.error("Error updating display badges:", error);
      toast.error(error.response?.data?.message || "Failed to update display badges");
      set({ error: error.response?.data?.message || error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  // Clear badge data (for logout)
  clearBadgeData: () => {
    set({
      availableBadges: [],
      userBadges: [],
      displayBadges: [],
      loading: false,
      error: null
    });
  }
}));
