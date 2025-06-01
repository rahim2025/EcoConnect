import Notification from "../models/notification.model.js";

// Get all notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
      const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "fullName profilePic")
      .populate("post", "image caption")
      .populate("event", "title date location image")
      .populate("marketplaceItem", "title price images")
      .sort({ createdAt: -1 })
      .limit(30);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Check if the notification belongs to the user
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.log("Error in markAsRead controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.log("Error in markAllAsRead controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Check if the notification belongs to the user
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.log("Error in deleteNotification controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get admin notifications (for report alerts and moderation)
export const getAdminNotifications = async (req, res) => {
  try {
    // This route should already be protected by admin middleware
    const notifications = await Notification.find({ isAdminNotification: true })
      .populate("sender", "fullName profilePic")
      .populate("post", "content image")
      .sort({ createdAt: -1 })
      .limit(30);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getAdminNotifications controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
