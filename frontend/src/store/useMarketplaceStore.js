import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useMarketplaceStore = create((set, get) => ({
  items: [],
  userItems: [],
  favoriteItems: [],
  favorites: [], // Alias for favoriteItems for convenience
  selectedItem: null,
  categories: [],
  stats: {},
  
  // UI states
  viewMode: 'grid', // 'grid' or 'list'
  
  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasMore: false
  },

  // Filters
  filters: {
    category: 'all',
    condition: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ecoFriendly: false,
    featured: false
  },

  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        category: 'all',
        condition: '',
        minPrice: '',
        maxPrice: '',
        location: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ecoFriendly: false,
        featured: false
      }
    });
  },

  // Set view mode
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },
  // Fetch marketplace items with filters and pagination
  getMarketplaceItems: async (page = 1, reset = false) => {
    try {
      set({ isLoading: true });
      const state = get();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...state.filters
      });

      const response = await axiosInstance.get(`/marketplace/items?${queryParams}`);
      
      set((state) => {
        let newItems;
        if (reset) {
          newItems = response.data.items;
        } else {
          // Merge items and remove duplicates by ID
          const existingIds = new Set(state.items.map(item => item._id));
          const uniqueNewItems = response.data.items.filter(item => !existingIds.has(item._id));
          newItems = [...state.items, ...uniqueNewItems];
        }
        
        return {
          items: newItems,
          pagination: response.data.pagination,
          isLoading: false
        };
      });

      return response.data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.error || "Failed to fetch marketplace items");
      throw error;
    }
  },

  // Get marketplace item by ID
  getMarketplaceItem: async (itemId) => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.get(`/marketplace/items/${itemId}`);
      
      set({
        selectedItem: response.data.item,
        isLoading: false 
      });

      return response.data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.error || "Failed to fetch item details");
      throw error;
    }
  },
  // Create marketplace item
  createMarketplaceItem: async (itemData) => {
    try {
      set({ isCreating: true });
      const response = await axiosInstance.post("/marketplace/items", itemData);
      
      set((state) => {
        // Check if item already exists to prevent duplicates
        const existingItemIndex = state.items.findIndex(item => item._id === response.data.item._id);
        const existingUserItemIndex = state.userItems.findIndex(item => item._id === response.data.item._id);
        
        let newItems = [...state.items];
        let newUserItems = [...state.userItems];
        
        if (existingItemIndex === -1) {
          newItems = [response.data.item, ...state.items];
        }
        
        if (existingUserItemIndex === -1) {
          newUserItems = [response.data.item, ...state.userItems];
        }
        
        return {
          items: newItems,
          userItems: newUserItems,
          isCreating: false
        };
      });

      toast.success("Item listed successfully!");
      return response.data.item;
    } catch (error) {
      set({ isCreating: false });
      toast.error(error.response?.data?.error || "Failed to create listing");
      throw error;
    }
  },

  // Update marketplace item
  updateMarketplaceItem: async (itemId, itemData) => {
    try {
      set({ isUpdating: true });
      const response = await axiosInstance.put(`/marketplace/items/${itemId}`, itemData);
      
      set((state) => ({
        items: state.items.map(item => 
          item._id === itemId ? response.data.item : item
        ),
        userItems: state.userItems.map(item => 
          item._id === itemId ? response.data.item : item
        ),
        selectedItem: state.selectedItem?._id === itemId ? response.data.item : state.selectedItem,
        isUpdating: false
      }));

      toast.success("Item updated successfully!");
      return response.data.item;
    } catch (error) {
      set({ isUpdating: false });
      toast.error(error.response?.data?.error || "Failed to update item");
      throw error;
    }
  },

  // Delete marketplace item
  deleteMarketplaceItem: async (itemId) => {
    try {
      await axiosInstance.delete(`/marketplace/items/${itemId}`);
      
      set((state) => ({
        items: state.items.filter(item => item._id !== itemId),
        userItems: state.userItems.filter(item => item._id !== itemId),
        favoriteItems: state.favoriteItems.filter(item => item._id !== itemId),
        favorites: state.favorites.filter(item => item._id !== itemId)
      }));

      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete item");
      throw error;
    }
  },

  // Get user's marketplace items
  getUserMarketplaceItems: async (userId = null, status = 'all', page = 1) => {
    try {
      set({ isLoading: true });
      const url = userId 
        ? `/marketplace/user/${userId}/items?status=${status}&page=${page}`
        : `/marketplace/my-items?status=${status}&page=${page}`;
      
      const response = await axiosInstance.get(url);
      
      set({
        userItems: response.data.items,
        items: response.data.items, // For MyItems page
        pagination: response.data.pagination,
        isLoading: false
      });

      return response.data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.error || "Failed to fetch user items");
      throw error;
    }
  },

  // Toggle favorite
  toggleFavorite: async (itemId) => {
    try {
      const response = await axiosInstance.post(`/marketplace/items/${itemId}/favorite`);
      
      set((state) => ({
        items: state.items.map(item => 
          item._id === itemId 
            ? { ...item, isFavorited: response.data.isFavorited }
            : item
        ),
        selectedItem: state.selectedItem?._id === itemId
          ? { ...state.selectedItem, isFavorited: response.data.isFavorited }
          : state.selectedItem
      }));

      toast.success(response.data.isFavorited ? "Added to favorites" : "Removed from favorites");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update favorites");
      throw error;
    }
  },

  // Get favorite items
  getFavoriteItems: async (page = 1) => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.get(`/marketplace/favorites?page=${page}`);
      
      set({
        favoriteItems: response.data.items,
        favorites: response.data.items, // Alias for convenience
        pagination: response.data.pagination,
        isLoading: false
      });

      return response.data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.error || "Failed to fetch favorite items");
      throw error;
    }
  },

  // Aliases for convenience
  fetchMyItems: async (status = 'all', page = 1) => {
    return get().getUserMarketplaceItems(null, status, page);
  },

  fetchFavorites: async (page = 1) => {
    return get().getFavoriteItems(page);
  },

  deleteItem: async (itemId) => {
    return get().deleteMarketplaceItem(itemId);
  },

  // Make offer
  makeOffer: async (itemId, offerData) => {
    try {
      const response = await axiosInstance.post(`/marketplace/items/${itemId}/offers`, offerData);
      
      set((state) => ({
        selectedItem: state.selectedItem?._id === itemId
          ? {
              ...state.selectedItem,
              offers: [...state.selectedItem.offers, response.data.offer]
            }
          : state.selectedItem
      }));

      toast.success("Offer submitted successfully!");
      return response.data.offer;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit offer");
      throw error;
    }
  },

  // Respond to offer
  respondToOffer: async (itemId, offerId, action) => {
    try {
      const response = await axiosInstance.patch(
        `/marketplace/items/${itemId}/offers/${offerId}`,
        { action }
      );
        set((state) => ({
        selectedItem: state.selectedItem?._id === itemId
          ? response.data.item
          : state.selectedItem
      }));

      toast.success(`Offer ${action}ed successfully!`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} offer`);
      throw error;
    }
  },

  // Mark as sold
  markAsSold: async (itemId) => {
    try {
      const response = await axiosInstance.patch(`/marketplace/items/${itemId}/sold`);
      
      set((state) => ({
        items: state.items.map(item => 
          item._id === itemId ? response.data.item : item
        ),
        userItems: state.userItems.map(item => 
          item._id === itemId ? response.data.item : item
        ),
        selectedItem: state.selectedItem?._id === itemId ? response.data.item : state.selectedItem
      }));

      toast.success("Item marked as sold!");
      return response.data.item;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to mark as sold");
      throw error;
    }
  },
  // Get categories
  getCategories: async () => {
    try {
      const response = await axiosInstance.get("/marketplace/categories");
      set({ categories: response.data });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch categories");
      throw error;
    }
  },
  // Get marketplace stats
  getMarketplaceStats: async () => {
    try {
      const response = await axiosInstance.get("/marketplace/stats");
      set({ stats: response.data });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch stats");
      throw error;
    }
  },
  // Clear selected item
  clearSelectedItem: () => {
    set({ selectedItem: null });
  },

  // Clear all items (useful for reset)
  clearItems: () => {
    set({ 
      items: [], 
      userItems: [], 
      favoriteItems: [], 
      favorites: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasMore: false
      }
    });
  },

  // Search items
  searchItems: async (searchTerm, page = 1) => {
    try {
      set({ isLoading: true });
      get().setFilters({ search: searchTerm });
      return await get().getMarketplaceItems(page, true);
    } catch (error) {
      throw error;
    }
  }
}));
