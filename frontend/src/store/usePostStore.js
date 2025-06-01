import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const usePostStore = create((set, get) => ({
  posts: [],
  allPosts: [],  // Store all posts to make filtering easier
  loading: false,
  creating: false,
  error: null,
  filterType: 'all', // 'all' or 'following'
  
  // Get feed posts
  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/posts/feed");
      set({ 
        posts: res.data, 
        allPosts: res.data, 
        loading: false 
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch posts", 
        loading: false 
      });
      toast.error(error.response?.data?.message || "Failed to fetch posts");
      return [];
    }
  },
  
  // Filter posts
  filterPosts: (filterType) => {
    set({ filterType });
    const { allPosts } = get();
    
    if (filterType === 'all') {
      set({ posts: allPosts });
    } else if (filterType === 'following') {
      // Get the current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user-info"));
      
      if (currentUser?.following) {
        // Only show posts from users the current user follows
        const filteredPosts = allPosts.filter(post => 
          post.user?._id === currentUser._id || // include own posts
          currentUser.following.includes(post.user?._id)
        );
        set({ posts: filteredPosts });
      }
    }
  },
  
  // Get posts by user ID
  fetchUserPosts: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/posts/user/${userId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      set({ error: error.response?.data?.message || "Failed to fetch user posts" });
      toast.error(error.response?.data?.message || "Failed to fetch user posts");
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  // Create new post
  createPost: async (postData) => {
    set({ creating: true, error: null });
    try {
      const res = await axiosInstance.post("/posts/create", postData);
      set(state => ({ 
        posts: [res.data, ...state.posts],
        allPosts: [res.data, ...state.allPosts],
        creating: false 
      }));
      toast.success("Post created successfully");
      return res.data;
    } catch (error) {
      console.error("Error creating post:", error);
      set({ 
        error: error.response?.data?.message || "Failed to create post", 
        creating: false 
      });
      toast.error(error.response?.data?.message || "Failed to create post");
      throw error;
    }
  },  // Like/unlike post
  likePost: async (postId) => {
    try {
      console.log('Attempting to like/unlike post ID:', postId);
      
      // Get current user from localStorage instead
      const authUser = JSON.parse(localStorage.getItem("user-info"));
      if (!authUser) {
        console.error('No authenticated user found in localStorage');
        toast.error("You must be logged in to like posts");
        return;
      }
      
      // Make API request to like/unlike post
      const response = await axiosInstance.post(`/posts/${postId}/like`);
        // This is a simplified approach - we'll just toggle the like status based on the current user
      set(state => ({        posts: state.posts.map(post => {
          if (post._id === postId) {
            // Simplify the approach: just check if current user ID exists in the likes array 
            // (as either a string ID or an object with _id)
            const userId = authUser._id;
            const likes = post.likes || [];
            
            // Check if the user already liked the post
            const userLiked = likes.some(like => 
              (like && typeof like === 'object' && like._id === userId) || like === userId
            );
            
            if (userLiked) {
              // Remove the like
              return {
                ...post,
                likes: likes.filter(like => 
                  !(like && typeof like === 'object' && like._id === userId) && like !== userId
                )
              };
            } else {
              // Add the like - we'll add just the ID to match the backend format
              return {
                ...post,
                likes: [...likes, userId]
              };
            }
          }
          return post;
        }),        allPosts: state.allPosts.map(post => {
          if (post._id === postId) {
            // Simplify the approach: just check if current user ID exists in the likes array 
            // (as either a string ID or an object with _id)
            const userId = authUser._id;
            const likes = post.likes || [];
            
            // Check if the user already liked the post
            const userLiked = likes.some(like => 
              (like && typeof like === 'object' && like._id === userId) || like === userId
            );
            
            if (userLiked) {
              // Remove the like
              return {
                ...post,
                likes: likes.filter(like => 
                  !(like && typeof like === 'object' && like._id === userId) && like !== userId
                )
              };
            } else {
              // Add the like - we'll add just the ID to match the backend format
              return {
                ...post,
                likes: [...likes, userId]
              };
            }
          }
          return post;
        })
      }));
      
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error(error.response?.data?.message || "Failed to like post");
    }
  },
  
  // Add comment to post
  commentOnPost: async (postId, text) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment`, { text });
      
      set(state => ({
        posts: state.posts.map(post => 
          post._id === postId ? res.data : post
        ),
        allPosts: state.allPosts.map(post => 
          post._id === postId ? res.data : post
        )
      }));
      
      toast.success("Comment added");
      return res.data;
    } catch (error) {
      console.error("Error commenting on post:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
      throw error;
    }
  },
  
  // Delete post
  deletePost: async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      
      set(state => ({
        posts: state.posts.filter(post => post._id !== postId),
        allPosts: state.allPosts.filter(post => post._id !== postId)
      }));
      
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  },
  
  // Search posts
  searchPosts: async (query) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/posts/search?query=${encodeURIComponent(query)}`);
      set({ loading: false });
      return res.data;
    } catch (error) {
      console.error("Error searching posts:", error);
      set({ 
        error: error.response?.data?.message || "Failed to search posts", 
        loading: false 
      });
      toast.error(error.response?.data?.message || "Failed to search posts");
      return [];
    }
  },
  
  // Delete comment from post
  deleteComment: async (postId, commentId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}/comment/${commentId}`);
      
      set(state => ({
        posts: state.posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment._id !== commentId)
            };
          }
          return post;
        }),
        allPosts: state.allPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment._id !== commentId)
            };
          }
          return post;
        })
      }));
      
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  },
}));
