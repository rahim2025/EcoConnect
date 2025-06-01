import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    
    // For each user, get the latest message and unread count
    const usersWithMeta = await Promise.all(
      users.map(async (user) => {
        // Find the latest message between the logged-in user and this user
        const latestMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        }).sort({ createdAt: -1 }).limit(1);
        
        // Count unread messages from this user to the logged-in user
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          read: false
        });
        
        // Create user object with additional properties
        return {
          ...user._doc,
          latestMessage: latestMessage?.text || (latestMessage?.image ? "Sent an image" : ""),
          unreadCount,
          lastMessageAt: latestMessage?.createdAt || null
        };
      })
    );
    
    res.status(200).json(usersWithMeta);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // First, get all messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    
    // Mark the messages from the other user as read
    await Message.updateMany(
      {
        senderId: userToChatId,
        receiverId: myId,
        read: false
      },
      { read: true }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      read: false,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // Emit the regular newMessage event
      io.to(receiverSocketId).emit("newMessage", newMessage);
      
      // Also emit a newChatNotification event with sender info for toast notifications
      const sender = req.user;
      io.to(receiverSocketId).emit("newChatNotification", {
        message: newMessage,
        sender: {
          _id: sender._id,
          fullName: sender.fullName,
          profilePic: sender.profilePic
        }
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count all unread messages where the user is the receiver
    const count = await Message.countDocuments({
      receiverId: userId,
      read: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.log("Error in getUnreadCount controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: senderId } = req.params;
    
    // Mark all messages from sender to receiver as read
    await Message.updateMany(
      {
        senderId,
        receiverId: userId,
        read: false
      },
      { read: true }
    );
    
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
