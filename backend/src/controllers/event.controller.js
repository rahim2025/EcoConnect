import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, category, image, maxParticipants } = req.body;
    const userId = req.user._id;

    if (!title || !description || !location || !date) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const eventData = {
      title,
      description,
      location,
      date,
      category: category || "other",
      organizer: userId,
      participants: [userId], // Organizer is automatically a participant
      maxParticipants: maxParticipants || 0
    };

    // Upload image if provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "eco_events",
      });
      eventData.image = uploadResponse.secure_url;
    }

    const newEvent = new Event(eventData);
    await newEvent.save();

    // Award eco points for creating an event
    await User.findByIdAndUpdate(userId, {
      $inc: { ecoPoints: 15 }
    });

    // Populate organizer data before sending response
    const populatedEvent = await Event.findById(newEvent._id)
      .populate("organizer", "fullName profilePic")
      .populate("participants", "fullName profilePic");

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.log("Error in createEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    
    // Apply filters if provided
    if (status) filter.status = status;
    if (category) filter.category = category;

    const events = await Event.find(filter)
      .sort({ date: 1 }) // Sort by date ascending (upcoming first)
      .populate("organizer", "fullName profilePic")
      .populate("participants", "fullName profilePic");
    
    res.status(200).json(events);
  } catch (error) {
    console.log("Error in getAllEvents controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const events = await Event.find({
      date: { $gte: currentDate },
      status: { $ne: "cancelled" }
    })
      .sort({ date: 1 })
      .limit(10)
      .populate("organizer", "fullName profilePic")
      .populate("participants", "fullName profilePic");
    
    res.status(200).json(events);
  } catch (error) {
    console.log("Error in getUpcomingEvents controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId)
      .populate("organizer", "fullName profilePic bio")
      .populate("participants", "fullName profilePic");
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.log("Error in getEventById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Join an event
export const joinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Cannot join past events" });
    }
    
    // Check if event is cancelled
    if (event.status === "cancelled") {
      return res.status(400).json({ message: "Cannot join cancelled events" });
    }
    
    // Check if event is full
    if (event.maxParticipants > 0 && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }
    
    // Check if user is already a participant
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "You are already participating in this event" });
    }
    
    // Add user to participants
    event.participants.push(userId);
    await event.save();
    
    // Create notification for event organizer
    if (event.organizer.toString() !== userId.toString()) {
      const notification = new Notification({
        recipient: event.organizer,
        sender: userId,
        type: 'event_join',
        event: eventId,
        message: `joined your event: ${event.title}`
      });
      await notification.save();
    }
    
    const updatedEvent = await Event.findById(eventId)
      .populate("organizer", "fullName profilePic")
      .populate("participants", "fullName profilePic");
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log("Error in joinEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Leave an event
export const leaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Cannot leave past events" });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() === userId.toString()) {
      return res.status(400).json({ message: "Event organizer cannot leave the event" });
    }
    
    // Check if user is a participant
    if (!event.participants.includes(userId)) {
      return res.status(400).json({ message: "You are not participating in this event" });
    }
    
    // Remove user from participants
    event.participants = event.participants.filter(
      participant => participant.toString() !== userId.toString()
    );
    await event.save();
    
    // Create notification for event organizer
    const notification = new Notification({
      recipient: event.organizer,
      sender: userId,
      type: 'event_leave',
      event: eventId,
      message: `left your event: ${event.title}`
    });
    await notification.save();
    
    const updatedEvent = await Event.findById(eventId)
      .populate("organizer", "fullName profilePic")
      .populate("participants", "fullName profilePic");
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log("Error in leaveEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { title, description, location, date, category, image, status, maxParticipants } = req.body;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the organizer can update this event" });
    }
    
    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    if (date) event.date = date;
    if (category) event.category = category;
    if (status) event.status = status;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    
    // Update image if provided
    if (image && image !== event.image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "eco_events",
      });
      event.image = uploadResponse.secure_url;
    }
    
    await event.save();
    
    // Notify participants about the update
    if (event.participants.length > 0) {
      const notificationPromises = event.participants
        .filter(participant => participant.toString() !== userId.toString()) // Don't notify the organizer
        .map(participantId => {
          return new Notification({
            recipient: participantId,
            sender: userId,
            type: 'event_update',
            event: eventId,
            message: `updated an event you're attending: ${event.title}`
          }).save();
        });
      
      await Promise.all(notificationPromises);
    }
    
    const updatedEvent = await Event.findById(eventId)
      .populate("organizer", "fullName profilePic")
      .populate("participants", "fullName profilePic");
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log("Error in updateEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the organizer can delete this event" });
    }
    
    // Notify participants about cancellation
    if (event.participants.length > 0) {
      const notificationPromises = event.participants
        .filter(participant => participant.toString() !== userId.toString()) // Don't notify the organizer
        .map(participantId => {
          return new Notification({
            recipient: participantId,
            sender: userId,
            type: 'event_cancel',
            message: `cancelled an event you were planning to attend: ${event.title}`
          }).save();
        });
      
      await Promise.all(notificationPromises);
    }
    
    // Delete the event
    await Event.findByIdAndDelete(eventId);
    
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.log("Error in deleteEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get events by user
export const getUserEvents = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    // Find events where user is organizer or participant
    const events = await Event.find({
      $or: [
        { organizer: userId },
        { participants: userId }
      ]
    })
      .sort({ date: 1 })
      .populate("organizer", "fullName profilePic")
      .populate("participants", "fullName profilePic");
    
    // Separate events into organized and participating
    const organizedEvents = events.filter(event => event.organizer._id.toString() === userId.toString());
    const participatingEvents = events.filter(event => event.organizer._id.toString() !== userId.toString());
    
    res.status(200).json({
      organized: organizedEvents,
      participating: participatingEvents
    });
  } catch (error) {
    console.log("Error in getUserEvents controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Complete an event (mark as completed and award points)
export const completeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the organizer can complete this event" });
    }
    
    // Update event status
    event.status = "completed";
    await event.save();
    
    // Award eco points to participants
    if (event.participants.length > 0) {
      await User.updateMany(
        { _id: { $in: event.participants } },
        { $inc: { ecoPoints: event.ecoPoints } }
      );
      
      // Notify participants about points
      const notificationPromises = event.participants
        .filter(participant => participant.toString() !== userId.toString()) // Don't notify the organizer
        .map(participantId => {
          return new Notification({
            recipient: participantId,
            sender: userId,
            type: 'eco_points',
            event: eventId,
            message: `You earned ${event.ecoPoints} eco points for participating in: ${event.title}`
          }).save();
        });
      
      await Promise.all(notificationPromises);
    }
    
    // Extra points for the organizer
    await User.findByIdAndUpdate(userId, {
      $inc: { ecoPoints: 10 } // Bonus for organizing
    });
    
    const updatedEvent = await Event.findById(eventId)
      .populate("organizer", "fullName profilePic")
      .populate("participants", "fullName profilePic");
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log("Error in completeEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Invite a user to an event
export const inviteUserToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId: invitedUserId } = req.body;
    const currentUserId = req.user._id;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Check if the invited user exists
    const invitedUser = await User.findById(invitedUserId);
    
    if (!invitedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if the user is already participating
    if (event.participants.includes(invitedUserId)) {
      return res.status(400).json({ message: "User is already participating in this event" });
    }
    
    // Create notification for the invited user
    const notification = new Notification({
      recipient: invitedUserId,
      sender: currentUserId,
      type: 'event_invite',
      event: eventId,
      content: `invited you to join an event: ${event.title}`,
      isRead: false
    });
    
    await notification.save();
    
    // Emit socket event if the user is online
    const { io, getReceiverSocketId } = await import('../lib/socket.js');
    const receiverSocketId = getReceiverSocketId(invitedUserId.toString());
    
    if (receiverSocketId) {
      // Get inviter details and event details to send with notification
      const inviterDetails = await User.findById(currentUserId).select('fullName profilePic');
      const eventDetails = { 
        _id: event._id, 
        title: event.title, 
        date: event.date,
        location: event.location,
        image: event.image
      };
      
      io.to(receiverSocketId).emit('newEventInvite', {
        _id: notification._id,
        sender: inviterDetails,
        event: eventDetails,
        content: notification.content,
        type: 'event_invite',
        createdAt: notification.createdAt
      });
    }
    
    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.log("Error in inviteUserToEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
