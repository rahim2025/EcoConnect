import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, image, tags, visibility } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const postData = {
      user: userId,
      content,
      tags: tags || [],
      visibility: visibility || "public"
    };

    // Handle image upload if provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "eco_posts",
      });
      postData.image = uploadResponse.secure_url;
    }

    const newPost = new Post(postData);
    await newPost.save();

    // Award eco points for creating a post
    await User.findByIdAndUpdate(userId, {
      $inc: { ecoPoints: 10 }
    });

    // Populate user data before sending response
    const populatedPost = await Post.findById(newPost._id)
      .populate("user", "fullName profilePic")
      .populate("likes", "fullName profilePic")
      .populate("comments.user", "fullName profilePic");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.log("Error in createPost controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all posts (feed)
export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    // Get posts from users the current user follows and their own posts
    const following = user.following;
    following.push(userId); // Include user's own posts
    
    const posts = await Post.find({
      $or: [
        { user: { $in: following } },
        { visibility: "public" }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullName profilePic")
      .populate("likes", "fullName profilePic")
      .populate("comments.user", "fullName profilePic");
    
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getFeedPosts controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get posts by user id
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    // Check if the requesting user is following the target user
    const isFollowing = await User.findOne({ 
      _id: currentUserId, 
      following: userId 
    });
    
    // Define visibility filter based on relationship
    let visibilityFilter;
    if (userId === currentUserId.toString()) {
      // User can see all their own posts
      visibilityFilter = {};
    } else if (isFollowing) {
      // User can see public and followers posts
      visibilityFilter = { visibility: { $in: ["public", "followers"] } };
    } else {
      // Other users can only see public posts
      visibilityFilter = { visibility: "public" };
    }
    
    const posts = await Post.find({ 
      user: userId,
      ...visibilityFilter
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullName profilePic")
      .populate("likes", "fullName profilePic")
      .populate("comments.user", "fullName profilePic");
    
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Like/unlike a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      // Unlike the post
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: userId }
      });
      res.status(200).json({ message: "Post unliked successfully" });    } else {
      // Like the post
      await Post.findByIdAndUpdate(postId, {
        $push: { likes: userId }
      });

      // Award eco points to the post creator (only if it's not the user's own post)
      if (post.user.toString() !== userId.toString()) {
        await User.findByIdAndUpdate(post.user, {
          $inc: { ecoPoints: 2 }
        });
        
        // Create a notification for the post owner
        const notification = new Notification({
          recipient: post.user,
          sender: userId,
          type: 'like',
          post: postId,
          isRead: false
        });
        await notification.save();
        
        // Emit socket event if the post owner is online
        const { io, getReceiverSocketId } = await import('../lib/socket.js');
        const receiverSocketId = getReceiverSocketId(post.user.toString());
        
        if (receiverSocketId) {
          // Get user details to send with notification
          const likerDetails = await User.findById(userId).select('fullName profilePic');
          const postDetails = { _id: post._id, content: post.content.substring(0, 50) };
          
          io.to(receiverSocketId).emit('newLike', {
            _id: notification._id,
            sender: likerDetails,
            post: postDetails,
            type: 'like',
            createdAt: notification.createdAt
          });
        }
      }
      
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.log("Error in likePost controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const comment = {
      user: userId,
      text
    };
    
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment }
    });    // Award eco points to the post creator (only if it's not the user's own post)
    if (post.user.toString() !== userId.toString()) {
      await User.findByIdAndUpdate(post.user, {
        $inc: { ecoPoints: 3 }
      });
      
      // Create a notification for the post owner
      const notification = new Notification({
        recipient: post.user,
        sender: userId,
        type: 'comment',
        post: postId,
        comment: text.substring(0, 100), // Store beginning of comment text
        isRead: false
      });
      await notification.save();
      
      // Emit socket event if the post owner is online
      const { io, getReceiverSocketId } = await import('../lib/socket.js');
      const receiverSocketId = getReceiverSocketId(post.user.toString());
      
      if (receiverSocketId) {
        // Get user details to send with notification
        const commenterDetails = await User.findById(userId).select('fullName profilePic');
        const postDetails = { _id: post._id, content: post.content.substring(0, 50) };
        
        io.to(receiverSocketId).emit('newComment', {
          _id: notification._id,
          sender: commenterDetails,
          post: postDetails,
          comment: text.substring(0, 100),
          type: 'comment',
          createdAt: notification.createdAt
        });
      }
    }
    
    // Get the updated post with populated fields
    const updatedPost = await Post.findById(postId)
      .populate("user", "fullName profilePic")
      .populate("likes", "fullName profilePic")
      .populate("comments.user", "fullName profilePic");
    
    res.status(200).json(updatedPost);
  } catch (error) {
    console.log("Error in addComment controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if the user is the comment creator or post owner
    if (comment.user.toString() !== userId.toString() && 
        post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }
    
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: { _id: commentId } }
    });
    
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log("Error in deleteComment controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if the user is the post creator
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }
    
    await Post.findByIdAndDelete(postId);
    
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Search posts by tags or content
export const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const posts = await Post.find({
      $and: [
        { visibility: "public" },
        {
          $or: [
            { content: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullName profilePic")
      .populate("likes", "fullName profilePic")
      .populate("comments.user", "fullName profilePic");
    
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in searchPosts controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Report a post
export const reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason, details } = req.body;
    const userId = req.user._id;
    
    if (!reason || !["inappropriate", "spam", "harmful", "misinformation", "other"].includes(reason)) {
      return res.status(400).json({ message: "Please provide a valid reason for reporting" });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if user has already reported this post
    const existingReport = post.reports.find(report => 
      report.user.toString() === userId.toString()
    );
    
    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this post" });
    }
    
    // Add the report
    post.reports.push({
      user: userId,
      reason,
      details,
      createdAt: Date.now()
    });
    
    await post.save();
      // Notify admins through notifications
    const adminNotification = new Notification({
      type: 'post_report',
      recipient: null, // null recipient means it's for all admins
      sender: userId,
      post: postId,
      message: `Post reported for ${reason}`,
      isAdminNotification: true
    });
    
    await adminNotification.save();
    
    res.status(200).json({ message: "Post reported successfully" });
  } catch (error) {
    console.log("Error in reportPost controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
