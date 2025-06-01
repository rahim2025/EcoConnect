import User from "../models/user.model.js";
import Badge from "../models/badge.model.js";
import UserBadge from "../models/userBadge.model.js";
import mongoose from "mongoose";

// Get all available badges
export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isAvailable: true });
    res.status(200).json(badges);
  } catch (error) {
    console.log("Error in getAllBadges controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get badges owned by a user
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const userBadges = await UserBadge.find({ user: userId })
      .populate("badge")
      .sort({ purchasedAt: -1 });
    
    res.status(200).json(userBadges);
  } catch (error) {
    console.log("Error in getUserBadges controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Purchase a new badge with eco points
export const purchaseBadge = async (req, res) => {
  try {
    const { badgeId } = req.body;
    const userId = req.user._id;
    
    // Find the badge
    const badge = await Badge.findById(badgeId);
    
    if (!badge) {
      return res.status(404).json({ message: "Badge not found" });
    }
    
    if (!badge.isAvailable) {
      return res.status(400).json({ message: "This badge is not available for purchase" });
    }
    
    // Check for badge validity period
    if (badge.validUntil && new Date(badge.validUntil) < new Date()) {
      return res.status(400).json({ message: "This badge is no longer available" });
    }
    
    // Check if user already has this badge
    const existingUserBadge = await UserBadge.findOne({ user: userId, badge: badgeId });
    if (existingUserBadge) {
      return res.status(400).json({ message: "You already own this badge" });
    }
    
    // Get user and check points
    const user = await User.findById(userId);
    
    if (user.ecoPoints < badge.cost) {
      return res.status(400).json({ 
        message: `Not enough eco points. You need ${badge.cost - user.ecoPoints} more points.` 
      });
    }
    
    // Create transaction - deduct points and add badge
    user.ecoPoints -= badge.cost;
    await user.save();
    
    // Create new user badge record
    const userBadge = new UserBadge({
      user: userId,
      badge: badgeId,
      purchasedAt: new Date(),
      isDisplayed: true
    });
    
    await userBadge.save();
    
    // If user doesn't have any display badges yet, add this one
    if (user.displayBadges.length === 0) {
      user.displayBadges.push(badgeId);
      await user.save();
    }
      // Create notification for badge purchase
    const Notification = mongoose.model('Notification');
    const notification = new Notification({
      recipient: userId,
      type: 'badge_purchase',
      content: `You purchased the ${badge.name} badge for ${badge.cost} eco points!`,
      isSystemNotification: true,
      isRead: false
    });
    await notification.save();
    
    // Emit socket event for real-time notification
    const { io, getReceiverSocketId } = await import('../lib/socket.js');
    const receiverSocketId = getReceiverSocketId(userId.toString());
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newBadgePurchase', {
        _id: notification._id,
        type: 'badge_purchase',
        content: notification.content,
        badgeName: badge.name,
        badgeImage: badge.imageUrl,
        isSystemNotification: true,
        createdAt: notification.createdAt
      });
    }
    
    // Return the complete badge with details
    const populatedUserBadge = await UserBadge.findById(userBadge._id).populate("badge");
    
    res.status(200).json({
      message: `Successfully purchased ${badge.name} badge!`,
      badge: populatedUserBadge,
      remainingPoints: user.ecoPoints
    });
    
  } catch (error) {
    console.log("Error in purchaseBadge controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update which badges are displayed on profile
export const updateDisplayBadges = async (req, res) => {
  try {
    const { badgeIds } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(badgeIds)) {
      return res.status(400).json({ message: "Badge IDs must be an array" });
    }
    
    if (badgeIds.length > 3) {
      return res.status(400).json({ message: "You can display up to 3 badges on your profile" });
    }
    
    // Check if user owns all these badges
    const userBadges = await UserBadge.find({ 
      user: userId,
      badge: { $in: badgeIds }
    });
    
    if (userBadges.length !== badgeIds.length) {
      return res.status(400).json({ message: "You can only display badges you own" });
    }
    
    // Update user's display badges
    const user = await User.findById(userId);
    user.displayBadges = badgeIds;
    await user.save();
    
    // Get complete user with populated badges
    const updatedUser = await User.findById(userId).populate("displayBadges");
    
    res.status(200).json({
      message: "Display badges updated successfully",
      displayBadges: updatedUser.displayBadges
    });
    
  } catch (error) {
    console.log("Error in updateDisplayBadges controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
