import Badge from '../models/badge.model.js';
import User from '../models/user.model.js';
import UserBadge from '../models/userBadge.model.js';
import mongoose from 'mongoose';
import '../models/post.model.js';
import '../models/event.model.js';
import '../models/reward.model.js';

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBadges = await Badge.countDocuments();
    const totalUserBadges = await UserBadge.countDocuments();
      // Get reported posts count
    let reportedPostsCount = 0;
    let pendingReportsCount = 0;
    try {
      const Post = mongoose.model('Post');
      reportedPostsCount = await Post.countDocuments({ 'reports.0': { $exists: true } });
      pendingReportsCount = await Post.countDocuments({ 'reports.status': 'pending' });
    } catch (error) {
      console.error('Error getting reported posts count:', error.message);
    }
      // Get events count
    let totalEvents = 0;
    let upcomingEvents = 0;
    try {
      const Event = mongoose.model('Event');
      totalEvents = await Event.countDocuments();
      upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
    } catch (error) {
      console.error('Error getting events count:', error.message);
    }
    
    // Get rewards count
    let rewardsCount = 0;
    try {
      const Reward = mongoose.model('Reward');
      rewardsCount = await Reward.countDocuments();
    } catch (error) {
      console.error('Rewards model error:', error.message);
    }
    
    // Get users with most points
    const topUsers = await User.find()
      .sort({ ecoPoints: -1 })
      .select('fullName profilePic ecoPoints')
      .limit(5);
    
    // Get most popular badges
    const popularBadges = await UserBadge.aggregate([
      { $group: { _id: '$badge', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const populatedBadges = await Badge.populate(
      popularBadges,
      { path: '_id', select: 'name icon category cost' }
    );
    
    const formattedPopularBadges = populatedBadges.map(item => ({
      badge: item._id,
      count: item.count
    }));
    
    res.status(200).json({
      stats: {
        totalUsers,
        totalBadges,
        totalUserBadges,
        reportedPostsCount,
        pendingReportsCount,
        totalEvents,
        upcomingEvents,
        rewardsCount
      },
      topUsers,
      popularBadges: formattedPopularBadges
    });  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    // Send a more detailed error message to help with debugging
    res.status(500).json({ 
      message: 'Error getting dashboard statistics',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Create a new badge
export const createBadge = async (req, res) => {
  try {
    const { name, description, icon, cost, category, isAvailable } = req.body;
    
    const newBadge = new Badge({
      name,
      description,
      icon,
      cost,
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    
    if (req.body.validUntil) {
      newBadge.validUntil = new Date(req.body.validUntil);
    }
    
    const savedBadge = await newBadge.save();
    res.status(201).json(savedBadge);
  } catch (error) {
    console.error('Error creating badge:', error);
    res.status(500).json({ message: 'Error creating badge' });
  }
};

// Get all users for admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error getting users' });
  }
};

// Update user points
export const updateUserPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.ecoPoints = points;
    await user.save();
    
    res.status(200).json({ 
      message: `User points updated successfully to ${points}`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        ecoPoints: user.ecoPoints
      }
    });
  } catch (error) {
    console.error('Error updating user points:', error);
    res.status(500).json({ message: 'Error updating user points' });
  }
};

// Send alert to user
export const sendUserAlert = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
      // Create notification for the user
    const notification = new mongoose.models.Notification({
      recipient: userId,
      type: type || 'admin-alert',
      content: message,
      isSystemNotification: true
    });
    
    await notification.save();
    
    // Send a socket notification if the user is online
    const { io, getReceiverSocketId } = await import('../lib/socket.js');
    const receiverSocketId = getReceiverSocketId(userId.toString());
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newAdminAlert', {
        _id: notification._id,
        type: notification.type,
        content: notification.content,
        isSystemNotification: notification.isSystemNotification,
        createdAt: notification.createdAt
      });
    }
    
    res.status(200).json({ 
      message: 'Alert sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({ message: 'Error sending user alert' });
  }
};

// Seed initial badges
export const seedBadges = async (req, res) => {
  try {
    // Delete existing badges
    await Badge.deleteMany({});
    
    // Create initial badges
    const badges = [
      // Beginner badges
      {
        name: 'Eco Starter',
        description: 'First steps in becoming environmentally conscious',
        icon: 'eco-starter.png',
        cost: 50,
        category: 'beginner',
        isAvailable: true
      },
      {
        name: 'Post Enthusiast',
        description: 'Share your eco-friendly ideas with the community',
        icon: 'post-enthusiast.png',
        cost: 75,
        category: 'beginner',
        isAvailable: true
      },
      {
        name: 'Community Member',
        description: 'Actively engaging with the eco-community',
        icon: 'community-member.png',
        cost: 100,
        category: 'beginner',
        isAvailable: true
      },
      
      // Intermediate badges
      {
        name: 'Event Participant',
        description: 'Join eco events and make a real-world impact',
        icon: 'event-participant.png',
        cost: 150,
        category: 'intermediate',
        isAvailable: true
      },
      {
        name: 'Resource Saver',
        description: 'Committed to reducing waste and saving resources',
        icon: 'resource-saver.png',
        cost: 200,
        category: 'intermediate',
        isAvailable: true
      },
      {
        name: 'Content Creator',
        description: 'Creating valuable content for the eco-community',
        icon: 'content-creator.png',
        cost: 250,
        category: 'intermediate',
        isAvailable: true
      },
      
      // Advanced badges
      {
        name: 'Event Organizer',
        description: 'Taking the lead in organizing environmental events',
        icon: 'event-organizer.png',
        cost: 400,
        category: 'advanced',
        isAvailable: true
      },
      {
        name: 'Eco Influencer',
        description: 'Your posts inspire others to take action',
        icon: 'eco-influencer.png',
        cost: 500,
        category: 'advanced',
        isAvailable: true
      },
      {
        name: 'Sustainability Champion',
        description: 'Champion of sustainable practices and lifestyle',
        icon: 'sustainability-champion.png',
        cost: 600,
        category: 'advanced',
        isAvailable: true
      },
      
      // Expert badges
      {
        name: 'Community Leader',
        description: 'Leading the community towards positive change',
        icon: 'community-leader.png',
        cost: 1000,
        category: 'expert',
        isAvailable: true
      },
      {
        name: 'Earth Guardian',
        description: 'Dedicated protector of our planet',
        icon: 'earth-guardian.png',
        cost: 1500,
        category: 'expert',
        isAvailable: true
      },
      {
        name: 'Climate Hero',
        description: 'Making a significant impact on climate action',
        icon: 'climate-hero.png',
        cost: 2000,
        category: 'expert',
        isAvailable: true
      },
      
      // Special badges
      {
        name: 'Eco Pioneer',
        description: 'Among the first to join our eco-friendly platform',
        icon: 'eco-pioneer.png',
        cost: 500,
        category: 'special',
        isAvailable: true
      },
      {
        name: 'Anniversary Badge',
        description: 'Celebrating one year of environmental action',
        icon: 'anniversary.png',
        cost: 300,
        category: 'special',
        isAvailable: true,
        validUntil: new Date(2025, 11, 31) // Valid until Dec 31, 2025
      }
    ];
    
    // Insert badges
    await Badge.insertMany(badges);
    
    res.status(200).json({ message: `${badges.length} badges have been seeded successfully` });
    
  } catch (error) {
    console.error('Error seeding badges:', error);
    res.status(500).json({ message: 'Error seeding badges' });
  }
};

// Get all reported posts for admin review
export const getReportedPosts = async (req, res) => {
  try {
    const Post = mongoose.model('Post');
    
    // Find posts that have at least one report
    const reportedPosts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('user', 'fullName profilePic')
      .populate('reports.user', 'fullName profilePic')
      .sort({ 'reports.createdAt': -1 });
    
    res.status(200).json(reportedPosts);
  } catch (error) {
    console.error('Error in getReportedPosts controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Review reported posts (approve, dismiss, or delete)
export const reviewReportedPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { action, reportIds } = req.body;
    
    if (!postId || !action || !reportIds || !reportIds.length) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    if (!['dismiss', 'hide', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    const Post = mongoose.model('Post');
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Update report statuses
    reportIds.forEach(reportId => {
      const report = post.reports.id(reportId);
      if (report) {
        report.status = action === 'dismiss' ? 'dismissed' : 'reviewed';
      }
    });
    
    // Handle post actions
    if (action === 'hide') {
      post.isHidden = true;
    } else if (action === 'delete') {
      await Post.findByIdAndDelete(postId);
      return res.status(200).json({ message: 'Post deleted successfully' });
    }
    
    if (action !== 'delete') {
      await post.save();
    }
    
    // Notify post creator if their post was hidden or deleted
    if (action === 'hide' || action === 'delete') {
      const Notification = mongoose.model('Notification');
      await Notification.create({
        type: action === 'hide' ? 'post_hidden' : 'post_deleted',
        recipient: post.user,
        message: `Your post was ${action === 'hide' ? 'hidden' : 'deleted'} for violating community standards`,
        post: action === 'hide' ? postId : undefined
      });
    }
    
    res.status(200).json({ 
      message: `Post ${action === 'dismiss' ? 'reports dismissed' : action + 'd'} successfully` 
    });
  } catch (error) {
    console.error('Error in reviewReportedPost controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all events with filtering options for admin management
export const getAllEvents = async (req, res) => {
  try {
    const { status, category } = req.query;
    const Event = mongoose.model('Event');
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const events = await Event.find(filter)
      .populate('organizer', 'fullName profilePic')
      .populate('participants', 'fullName profilePic')
      .sort({ date: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error in getAllEvents controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update event status (upcoming, ongoing, completed, cancelled)
export const updateEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, message } = req.body;
    
    if (!eventId || !status) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const Event = mongoose.model('Event');
    const Notification = mongoose.model('Notification');
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const previousStatus = event.status;
    event.status = status;
    
    if (status === 'completed' && previousStatus !== 'completed') {
      // Award points to participants when event is marked as completed
      const User = mongoose.model('User');
      const awardPromises = event.participants.map(async (participantId) => {
        await User.findByIdAndUpdate(participantId, {
          $inc: { ecoPoints: 50 }  // Award 50 points for participation
        });
        
        // Notify participants about points earned
        await Notification.create({
          type: 'points_earned',
          recipient: participantId,
          event: eventId,
          message: `You earned 50 eco points for participating in "${event.title}"`,
        });
      });
      
      await Promise.all(awardPromises);
    }
    
    await event.save();
    
    // Notify event organizer about status change
    await Notification.create({
      type: 'event_status_change',
      recipient: event.organizer,
      event: eventId,
      message: `Your event "${event.title}" status was changed to ${status}${message ? ': ' + message : ''}`,
    });
    
    res.status(200).json({ 
      message: `Event status updated to ${status} successfully`,
      event
    });
  } catch (error) {
    console.error('Error in updateEventStatus controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all rewards for admin management
export const getAllRewards = async (req, res) => {
  try {
    const Reward = mongoose.model('Reward');
    
    const rewards = await Reward.find()
      .sort('-createdAt')
      .populate('redemptions.user', 'fullName profilePic');
    
    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error in getAllRewards controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create a new reward
export const createReward = async (req, res) => {
  try {
    const { name, description, pointCost, category, quantity, image, expiresAt } = req.body;
    
    if (!name || !description || !pointCost) {
      return res.status(400).json({ message: 'Name, description and pointCost are required' });
    }
    
    const Reward = mongoose.model('Reward');
    
    let imageUrl = '';
    if (image && image.startsWith('data:image')) {
      // Upload image to cloudinary
      const cloudinary = (await import('../lib/cloudinary.js')).default;
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'eco_rewards'
      });
      imageUrl = uploadResponse.secure_url;
    }
    
    const newReward = new Reward({
      name,
      description,
      pointCost: Number(pointCost),
      category: category || 'other',
      quantity: quantity ? Number(quantity) : -1,
      image: imageUrl,
      expiresAt: expiresAt || null
    });
    
    await newReward.save();
    
    res.status(201).json(newReward);
  } catch (error) {
    console.error('Error in createReward controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update an existing reward
export const updateReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const { name, description, pointCost, category, quantity, image, expiresAt, available } = req.body;
    
    const Reward = mongoose.model('Reward');
    const reward = await Reward.findById(rewardId);
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    
    // Update fields if provided
    if (name) reward.name = name;
    if (description) reward.description = description;
    if (pointCost) reward.pointCost = Number(pointCost);
    if (category) reward.category = category;
    if (quantity !== undefined) reward.quantity = Number(quantity);
    if (expiresAt !== undefined) reward.expiresAt = expiresAt || null;
    if (available !== undefined) reward.available = Boolean(available);
    
    // Handle image update if provided and is a new image
    if (image && image.startsWith('data:image') && image !== reward.image) {
      const cloudinary = (await import('../lib/cloudinary.js')).default;
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'eco_rewards'
      });
      reward.image = uploadResponse.secure_url;
    }
    
    await reward.save();
    
    res.status(200).json(reward);
  } catch (error) {
    console.error('Error in updateReward controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a reward
export const deleteReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    
    const Reward = mongoose.model('Reward');
    const reward = await Reward.findById(rewardId);
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    
    // Check if there are pending redemptions
    const pendingRedemptions = reward.redemptions.filter(r => r.status === 'pending');
    if (pendingRedemptions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete reward with pending redemptions',
        pendingCount: pendingRedemptions.length
      });
    }
    
    await Reward.findByIdAndDelete(rewardId);
    
    res.status(200).json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReward controller:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
