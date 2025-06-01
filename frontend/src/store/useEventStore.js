import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export const useEventStore = create((set, get) => ({
  events: [],
  upcomingEvents: [],
  userEvents: {
    organized: [],
    participating: []
  },
  currentEvent: null,
  loading: false,
  creating: false,
  error: null,
  
  // Fetch all events
  fetchEvents: async (filters = {}) => {
    set({ loading: true });
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.category) queryParams.append("category", filters.category);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const res = await axiosInstance.get(`/events${query}`);
      
      set({ events: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
      set({ error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  // Fetch upcoming events
  fetchUpcomingEvents: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/events/upcoming");
      
      set({ upcomingEvents: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      toast.error("Failed to load upcoming events");
      set({ error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  // Fetch event by ID
  fetchEventById: async (eventId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/events/${eventId}`);
      
      set({ currentEvent: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event details");
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  // Fetch user events (organized and participating)
  fetchUserEvents: async (userId = null) => {
    set({ loading: true });
    try {
      const endpoint = userId ? `/events/user/${userId}` : "/events/user";
      const res = await axiosInstance.get(endpoint);
      
      set({ userEvents: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching user events:", error);
      toast.error("Failed to load your events");
      set({ error: error.message });
      return { organized: [], participating: [] };
    } finally {
      set({ loading: false });
    }
  },
  
  // Create new event
  createEvent: async (eventData) => {
    set({ creating: true });
    try {
      const res = await axiosInstance.post("/events/create", eventData);
      
      set(state => ({
        events: [res.data, ...state.events],
        userEvents: {
          ...state.userEvents,
          organized: [res.data, ...state.userEvents.organized]
        }
      }));
      
      toast.success("Event created successfully");
      return res.data;
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.message || "Failed to create event");
      set({ error: error.message });
      return null;
    } finally {
      set({ creating: false });
    }
  },
  
  // Update event
  updateEvent: async (eventId, eventData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/events/${eventId}`, eventData);
      
      // Update event in all relevant state arrays
      set(state => ({
        events: state.events.map(event => 
          event._id === eventId ? res.data : event
        ),
        upcomingEvents: state.upcomingEvents.map(event => 
          event._id === eventId ? res.data : event
        ),
        userEvents: {
          organized: state.userEvents.organized.map(event => 
            event._id === eventId ? res.data : event
          ),
          participating: state.userEvents.participating.map(event => 
            event._id === eventId ? res.data : event
          )
        },
        currentEvent: state.currentEvent?._id === eventId ? res.data : state.currentEvent
      }));
      
      toast.success("Event updated successfully");
      return res.data;
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error.response?.data?.message || "Failed to update event");
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  // Delete event
  deleteEvent: async (eventId) => {
    try {
      await axiosInstance.delete(`/events/${eventId}`);
      
      // Remove event from all state arrays
      set(state => ({
        events: state.events.filter(event => event._id !== eventId),
        upcomingEvents: state.upcomingEvents.filter(event => event._id !== eventId),
        userEvents: {
          organized: state.userEvents.organized.filter(event => event._id !== eventId),
          participating: state.userEvents.participating.filter(event => event._id !== eventId)
        },
        currentEvent: state.currentEvent?._id === eventId ? null : state.currentEvent
      }));
      
      toast.success("Event deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.response?.data?.message || "Failed to delete event");
      set({ error: error.message });
      return false;
    }
  },
  
  // Join event
  joinEvent: async (eventId) => {
    try {
      const res = await axiosInstance.post(`/events/${eventId}/join`);
      
      // Update event in all relevant state arrays
      set(state => ({
        events: state.events.map(event => 
          event._id === eventId ? res.data : event
        ),
        upcomingEvents: state.upcomingEvents.map(event => 
          event._id === eventId ? res.data : event
        ),
        currentEvent: state.currentEvent?._id === eventId ? res.data : state.currentEvent
      }));
      
      // Add event to participating events if not there already
      set(state => {
        const isAlreadyParticipating = state.userEvents.participating.some(
          event => event._id === eventId
        );
        
        if (!isAlreadyParticipating) {
          return {
            userEvents: {
              ...state.userEvents,
              participating: [res.data, ...state.userEvents.participating]
            }
          };
        }
        
        return state;
      });
      
      toast.success("You've joined the event!");
      return res.data;
    } catch (error) {
      console.error("Error joining event:", error);
      toast.error(error.response?.data?.message || "Failed to join event");
      set({ error: error.message });
      return null;
    }
  },
  
  // Leave event
  leaveEvent: async (eventId) => {
    try {
      const res = await axiosInstance.post(`/events/${eventId}/leave`);
      
      // Update event in all relevant state arrays
      set(state => ({
        events: state.events.map(event => 
          event._id === eventId ? res.data : event
        ),
        upcomingEvents: state.upcomingEvents.map(event => 
          event._id === eventId ? res.data : event
        ),
        userEvents: {
          ...state.userEvents,
          participating: state.userEvents.participating.filter(event => event._id !== eventId)
        },
        currentEvent: state.currentEvent?._id === eventId ? res.data : state.currentEvent
      }));
      
      toast.success("You've left the event");
      return res.data;
    } catch (error) {
      console.error("Error leaving event:", error);
      toast.error(error.response?.data?.message || "Failed to leave event");
      set({ error: error.message });
      return null;
    }
  },
  
  // Complete event
  completeEvent: async (eventId) => {
    try {
      const res = await axiosInstance.post(`/events/${eventId}/complete`);
      
      // Update event in all relevant state arrays
      set(state => ({
        events: state.events.map(event => 
          event._id === eventId ? res.data : event
        ),
        userEvents: {
          organized: state.userEvents.organized.map(event => 
            event._id === eventId ? res.data : event
          ),
          participating: state.userEvents.participating.map(event => 
            event._id === eventId ? res.data : event
          )
        },
        currentEvent: state.currentEvent?._id === eventId ? res.data : state.currentEvent
      }));
      
      toast.success("Event marked as completed and eco points awarded!");
      return res.data;
    } catch (error) {
      console.error("Error completing event:", error);
      toast.error(error.response?.data?.message || "Failed to complete event");
      set({ error: error.message });
      return null;
    }
  },
  
  // Format event date for display
  formatEventDate: (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        full: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        fromNow: formatDistanceToNow(date, { addSuffix: true })
      };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { full: "Invalid date", fromNow: "Unknown" };
    }
  }
}));
