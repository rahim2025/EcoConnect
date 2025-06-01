import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePointsStore = create((set) => ({
  pointsSummary: null,
  leaderboard: [],
  loading: false,
  error: null,
  
  // Get points summary for a user
  getPointsSummary: async (userId = null) => {
    set({ loading: true });
    try {
      const endpoint = userId ? `/points/summary/${userId}` : "/points/summary";
      const res = await axiosInstance.get(endpoint);
      
      set({ pointsSummary: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching points summary:", error);
      toast.error("Failed to load eco points summary");
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  // Get eco points leaderboard
  getLeaderboard: async (limit = 10) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/points/leaderboard?limit=${limit}`);
      
      set({ leaderboard: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
      set({ error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  // Clear points data (for logout)
  clearPointsData: () => {
    set({
      pointsSummary: null,
      leaderboard: [],
      loading: false,
      error: null
    });
  }
}));
