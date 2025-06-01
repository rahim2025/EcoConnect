import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Event from "../models/event.model.js";
import Notification from "../models/notification.model.js";

// Get a user's eco points summary
export const getPointsSummary = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    // Get basic user info with total points
    const user = await User.findById(userId)
      .select("fullName profilePic ecoPoints");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get post counts
    const posts = await Post.find({ user: userId });
    const postsCount = posts.length;
    const postsPoints = postsCount * 10; // 10 points per post
    
    // Get likes received count
    let likesReceived = 0;
    for (const post of posts) {
      likesReceived += post.likes.length;
    }
    const likesPoints = likesReceived * 2; // 2 points per like received
    
    // Get comments received count
    let commentsReceived = 0;
    for (const post of posts) {
      commentsReceived += post.comments.length;
    }
    const commentsPoints = commentsReceived * 3; // 3 points per comment received
    
    // Get events organized count
    const eventsOrganized = await Event.countDocuments({ organizer: userId });
    const eventsOrganizedPoints = eventsOrganized * 15; // 15 points per event organized
    
    // Get events participated count
    const eventsParticipated = await Event.countDocuments({
      participants: userId,
      organizer: { $ne: userId },
      status: "completed"
    });
    
    // For simplicity, we'll estimate participation points using an average
    const eventsParticipatedPoints = eventsParticipated * 25; // average of 25 points per event
    
    // Get completed events (for bonus organizer points)
    const completedEventsOrganized = await Event.countDocuments({
      organizer: userId,
      status: "completed"
    });
    const completedBonus = completedEventsOrganized * 10; // 10 bonus points per completed event
    
    // Calculate other points (from things we haven't explicitly tracked)
    const otherPoints = user.ecoPoints - (
      postsPoints + likesPoints + commentsPoints + 
      eventsOrganizedPoints + eventsParticipatedPoints + completedBonus
    );
    
    // Response data
    const pointsSummary = {
      user: {
        _id: user._id,
        fullName: user.fullName,
        profilePic: user.profilePic,
        totalEcoPoints: user.ecoPoints
      },
      breakdown: {
        posts: {
          count: postsCount,
          points: postsPoints,
          pointsPerPost: 10
        },
        likes: {
          count: likesReceived,
          points: likesPoints,
          pointsPerLike: 2
        },
        comments: {
          count: commentsReceived,
          points: commentsPoints,
          pointsPerComment: 3
        },
        eventsOrganized: {
          count: eventsOrganized,
          points: eventsOrganizedPoints,
          completedCount: completedEventsOrganized,
          completedBonusPoints: completedBonus,
          pointsPerEvent: 15,
          bonusPerCompletedEvent: 10
        },
        eventsParticipated: {
          count: eventsParticipated,
          points: eventsParticipatedPoints,
          averagePointsPerEvent: 25
        },
        other: {
          points: otherPoints > 0 ? otherPoints : 0
        }
      }
    };
    
    res.status(200).json(pointsSummary);
  } catch (error) {
    console.log("Error in getPointsSummary controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get leaderboard of top users by eco points
export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const leaderboard = await User.find()
      .select("fullName profilePic ecoPoints")
      .sort({ ecoPoints: -1 })
      .limit(limit);
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.log("Error in getLeaderboard controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
