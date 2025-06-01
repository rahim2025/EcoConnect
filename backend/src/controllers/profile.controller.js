import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

// Get the current user's profile
export const getProfile = async (req, res) => {  try {
    // User can fetch their own profile with /me or another profile with /:id
    const userId = req.params.id || req.user._id;
    
    console.log(`Fetching profile for userId: ${userId}, type: ${typeof userId}`);
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`Invalid MongoDB ObjectId: ${userId}`);
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Convert string ID to ObjectId for proper MongoDB comparison
    const objectId = new mongoose.Types.ObjectId(userId);
      // Fetch user with populated followers and following
    const user = await User.findById(objectId)
      .select("-password")
      .populate("followers", "_id fullName profilePic")
      .populate("following", "_id fullName profilePic");
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`Found user: ${user.fullName}, ID: ${user._id}`); // Debugging info
    
    console.log(`Profile retrieved for user: ${user.fullName}`);
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { bio, location, interests, profilePic } = req.body;
    const userId = req.user._id;
    
    const updateData = {};
    
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests !== undefined) updateData.interests = interests;
    
    // Handle profile picture upload if provided
    if (profilePic && profilePic !== req.user.profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = req.user._id;
    
    console.log(`User ${currentUserId} is trying to follow user ${userToFollowId}`);
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userToFollowId)) {
      console.log(`Invalid MongoDB ObjectId: ${userToFollowId}`);
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Convert to MongoDB ObjectId
    const userToFollow = new mongoose.Types.ObjectId(userToFollowId);
    const currentUser = new mongoose.Types.ObjectId(currentUserId);
    
    // Check if the user exists
    const userToFollowExists = await User.findById(userToFollow);
    if (!userToFollowExists) {
      console.log(`User to follow not found: ${userToFollowId}`);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user is trying to follow themselves
    if (userToFollow.toString() === currentUser.toString()) {
      console.log("User trying to follow themselves");
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
      // Check if already following
    const isAlreadyFollowing = await User.findOne({
      _id: currentUser,
      following: userToFollow
    });
    
    if (isAlreadyFollowing) {
      console.log(`User ${currentUser} is already following ${userToFollow}`);
      return res.status(400).json({ message: "You are already following this user" });
    }
    
    console.log(`User ${currentUser} will now follow ${userToFollow}`);
    
    // Add to following and followers
    await User.findByIdAndUpdate(
      currentUser,
      { $push: { following: userToFollow } }
    );
    
    await User.findByIdAndUpdate(
      userToFollow,
      { $push: { followers: currentUser } }
    );
      // Award eco points for building connections
    await User.findByIdAndUpdate(
      currentUser,
      { $inc: { ecoPoints: 5 } }
    );
    
    // Create a notification for the user being followed
    const Notification = mongoose.model('Notification');
    const notification = new Notification({
      recipient: userToFollow,  // The user being followed receives the notification
      sender: currentUser,      // The current user is the one following
      type: 'follow',
      isRead: false
    });
    await notification.save();
    
    // Emit socket event if the user is online
    const { io, getReceiverSocketId } = await import('../lib/socket.js');
    const receiverSocketId = getReceiverSocketId(userToFollow.toString());
    
    if (receiverSocketId) {
      // Get follower details to send with notification
      const followerDetails = await User.findById(currentUser).select('fullName profilePic');
      
      io.to(receiverSocketId).emit('newFollower', {
        _id: notification._id,
        follower: followerDetails,
        createdAt: notification.createdAt
      });
    }
    
    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.log("Error in followUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.user._id;
    
    console.log(`User ${currentUserId} is trying to unfollow user ${userToUnfollowId}`);
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userToUnfollowId)) {
      console.log(`Invalid MongoDB ObjectId: ${userToUnfollowId}`);
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Convert to MongoDB ObjectId
    const userToUnfollow = new mongoose.Types.ObjectId(userToUnfollowId);
    const currentUser = new mongoose.Types.ObjectId(currentUserId);
    
    // Check if the user exists
    const userToUnfollowExists = await User.findById(userToUnfollow);
    if (!userToUnfollowExists) {
      console.log(`User to unfollow not found: ${userToUnfollowId}`);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user is trying to unfollow themselves
    if (userToUnfollow.toString() === currentUser.toString()) {
      console.log("User trying to unfollow themselves");
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }
      // Check if actually following
    const isFollowing = await User.findOne({
      _id: currentUser,
      following: userToUnfollow
    });
    
    if (!isFollowing) {
      console.log(`User ${currentUser} is not following ${userToUnfollow}`);
      return res.status(400).json({ message: "You are not following this user" });
    }
    
    console.log(`User ${currentUser} will now unfollow ${userToUnfollow}`);
    
    // Remove from following and followers
    await User.findByIdAndUpdate(
      currentUser,
      { $pull: { following: userToUnfollow } }
    );
    
    await User.findByIdAndUpdate(
      userToUnfollow,
      { $pull: { followers: currentUser } }
    );
    
    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.log("Error in unfollowUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get followers of current user
export const getFollowers = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .select("followers")
      .populate("followers", "_id fullName profilePic bio");
    
    res.status(200).json(user.followers);
  } catch (error) {
    console.log("Error in getFollowers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get users that current user is following
export const getFollowing = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .select("following")
      .populate("following", "_id fullName profilePic bio");
    
    res.status(200).json(user.following);
  } catch (error) {
    console.log("Error in getFollowing controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    console.log(`Searching for users with query: "${query}"`);
    
    if (!query && query !== "") {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    // If query is empty string, return a sampling of users (limited)
    const searchCriteria = query === "" 
      ? {} // Empty query returns all users
      : {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { interests: { $elemMatch: { $regex: query, $options: "i" } } }
          ]
        };
    
    // Search by name, email, location or interests
    const users = await User.find(searchCriteria)
      .select("_id fullName profilePic bio location ecoPoints")
      .limit(20);
      console.log(`Found ${users.length} matching users`);
    
    // Log user IDs for debugging
    if (users.length > 0) {
      console.log("User IDs found:");
      users.forEach(user => {
        console.log(`- ${user._id} (${user.fullName})`);
      });
    }
    
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update eco points
export const updateEcoPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const userId = req.user._id;
    
    if (typeof points !== 'number') {
      return res.status(400).json({ message: "Points must be a number" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { ecoPoints: points } },
      { new: true }
    ).select("-password");
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateEcoPoints controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
