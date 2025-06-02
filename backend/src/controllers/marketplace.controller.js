import MarketplaceItem from "../models/marketplaceItem.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

// Create a new marketplace item
export const createMarketplaceItem = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      condition,
      location,
      isEcoFriendly,
      ecoFeatures,
      allowOffers,
      tags,
      shippingOptions,
      contactPreferences
    } = req.body;

    let images = [];
      // Handle image uploads
    if (req.body.images && Array.isArray(req.body.images)) {
      for (const imageData of req.body.images) {
        if (imageData.startsWith('data:image')) {
          const uploadResponse = await cloudinary.uploader.upload(imageData, {
            folder: 'marketplace_items',
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto:good" },
              { format: "auto" }
            ]
          });
          images.push(uploadResponse.secure_url);
        }
      }
    }

    const marketplaceItem = new MarketplaceItem({
      title,
      description,
      price: parseFloat(price),
      category,
      condition,
      images,
      seller: req.user._id,
      location,
      isEcoFriendly: isEcoFriendly || false,
      ecoFeatures: ecoFeatures || [],
      allowOffers: allowOffers !== false, // Default to true
      tags: tags || [],
      shippingOptions: shippingOptions || { pickup: true, delivery: false, shipping: false },
      contactPreferences: contactPreferences || { showPhone: false, showEmail: true, messagesOnly: false }
    });

    await marketplaceItem.save();
    await marketplaceItem.populate('seller', 'fullName profilePic location');

    // Award eco points for eco-friendly items
    if (isEcoFriendly) {
      const user = await User.findById(req.user._id);
      user.ecoPoints += 10; // Award 10 points for eco-friendly listing
      await user.save();
    }

    res.status(201).json({
      message: "Marketplace item created successfully",
      item: marketplaceItem
    });
  } catch (error) {
    console.error("Error creating marketplace item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all marketplace items with filters and pagination
export const getMarketplaceItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      condition,
      minPrice,
      maxPrice,
      location,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ecoFriendly,
      featured
    } = req.query;

    const query = { status: 'available' };

    // Apply filters
    if (category && category !== 'all') {
      query.category = category;
    }

    if (condition) {
      query.condition = condition;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (ecoFriendly === 'true') {
      query.isEcoFriendly = true;
    }

    if (featured === 'true') {
      query.isFeatured = true;
      query.featuredUntil = { $gt: new Date() };
    }

    // Handle search
    if (search) {
      query.$text = { $search: search };
    }

    // Set up sort options
    const sortOptions = {};
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    }
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MarketplaceItem.find(query)
      .populate('seller', 'fullName profilePic location')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments(query);

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasMore: skip + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single marketplace item by ID
export const getMarketplaceItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const item = await MarketplaceItem.findById(id)
      .populate('seller', 'fullName profilePic location email')
      .populate('offers.buyer', 'fullName profilePic');

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }    // Increment views if not the seller
    if (item.seller._id.toString() !== req.user._id.toString()) {
      await item.incrementViews();
    }

    res.json({ item });
  } catch (error) {
    console.error("Error fetching marketplace item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's marketplace items
export const getUserMarketplaceItems = async (req, res) => {
  try {
    const { userId = req.user._id } = req.params;
    const { status = 'all', page = 1, limit = 20 } = req.query;

    const query = { seller: userId };
    
    if (status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MarketplaceItem.find(query)
      .populate('seller', 'fullName profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments(query);

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasMore: skip + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error("Error fetching user marketplace items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update marketplace item
export const updateMarketplaceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const item = await MarketplaceItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if user is the seller
    if (!item.canEdit(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Handle image updates
    if (updates.images && Array.isArray(updates.images)) {
      const images = [];
      for (const imageData of updates.images) {        if (imageData.startsWith('data:image')) {
          const uploadResponse = await cloudinary.uploader.upload(imageData, {
            folder: 'marketplace_items',
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto:good" },
              { format: "auto" }
            ]
          });
          images.push(uploadResponse.secure_url);
        } else if (imageData.startsWith('http')) {
          images.push(imageData); // Keep existing URLs
        }
      }
      updates.images = images;
    }

    // Prevent updating seller
    delete updates.seller;
    delete updates.offers;

    const updatedItem = await MarketplaceItem.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('seller', 'fullName profilePic location');

    res.json({
      message: "Item updated successfully",
      item: updatedItem
    });
  } catch (error) {
    console.error("Error updating marketplace item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete marketplace item
export const deleteMarketplaceItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const item = await MarketplaceItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if user is the seller
    if (!item.canEdit(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await MarketplaceItem.findByIdAndDelete(id);

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting marketplace item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Toggle favorite item
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const item = await MarketplaceItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const isFavorited = item.favoriteBy.includes(userId);

    if (isFavorited) {
      item.favoriteBy = item.favoriteBy.filter(id => id.toString() !== userId.toString());
    } else {
      item.favoriteBy.push(userId);
    }

    await item.save();

    res.json({
      message: isFavorited ? "Removed from favorites" : "Added to favorites",
      isFavorited: !isFavorited
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's favorite items
export const getFavoriteItems = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await MarketplaceItem.find({
      favoriteBy: req.user._id,
      status: 'available'
    })
      .populate('seller', 'fullName profilePic location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments({
      favoriteBy: req.user._id,
      status: 'available'
    });

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasMore: skip + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error("Error fetching favorite items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Make an offer on an item
export const makeOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid offer amount is required" });
    }

    const item = await MarketplaceItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.status !== 'available') {
      return res.status(400).json({ error: "Item is not available" });
    }

    if (!item.allowOffers) {
      return res.status(400).json({ error: "Offers are not allowed for this item" });
    }

    // Check if user is the seller
    if (item.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot make an offer on your own item" });
    }

    // Check if user already has a pending offer
    const existingOffer = item.offers.find(
      offer => offer.buyer.toString() === req.user._id.toString() && offer.status === 'pending'
    );

    if (existingOffer) {
      return res.status(400).json({ error: "You already have a pending offer on this item" });
    }

    const newOffer = {
      buyer: req.user._id,
      amount: parseFloat(amount),
      message: message || '',
      status: 'pending'
    };    item.offers.push(newOffer);
    await item.save();

    await item.populate('offers.buyer', 'fullName profilePic');

    // Create notification for the marketplace item owner
    const notification = new Notification({
      recipient: item.seller,
      sender: req.user._id,
      type: 'marketplace_offer',
      marketplaceItem: item._id,
      message: `made an offer of $${amount} on your listing: ${item.title}`,
      isRead: false
    });
    await notification.save();

    // Emit socket event for real-time notification
    const { io, getReceiverSocketId } = await import('../lib/socket.js');
    const receiverSocketId = getReceiverSocketId(item.seller.toString());
    
    if (receiverSocketId) {
      // Get buyer details to send with notification
      const buyerDetails = await User.findById(req.user._id).select('fullName profilePic');
      const itemDetails = { 
        _id: item._id, 
        title: item.title, 
        price: item.price,
        images: item.images
      };
      
      io.to(receiverSocketId).emit('newMarketplaceOffer', {
        _id: notification._id,
        sender: buyerDetails,
        marketplaceItem: itemDetails,
        message: notification.message,
        amount: amount,
        type: 'marketplace_offer',
        createdAt: notification.createdAt
      });
    }

    res.status(201).json({
      message: "Offer submitted successfully",
      offer: item.offers[item.offers.length - 1]
    });
  } catch (error) {
    console.error("Error making offer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Respond to an offer (accept/reject)
export const respondToOffer = async (req, res) => {
  try {
    const { itemId, offerId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const item = await MarketplaceItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if user is the seller
    if (!item.canEdit(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const offer = item.offers.id(offerId);

    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ error: "Offer is no longer pending" });
    }

    offer.status = action === 'accept' ? 'accepted' : 'rejected';

    // If offer is accepted, mark item as pending and reject other offers
    if (action === 'accept') {
      item.status = 'pending';
      item.offers.forEach(otherOffer => {
        if (otherOffer._id.toString() !== offerId && otherOffer.status === 'pending') {
          otherOffer.status = 'rejected';
        }
      });
    }    await item.save();

    // Populate the updated item with offers
    await item.populate('offers.buyer', 'fullName profilePic');

    res.json({
      message: `Offer ${action}ed successfully`,
      item,
      offer
    });
  } catch (error) {
    console.error("Error responding to offer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark item as sold
export const markAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const item = await MarketplaceItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if user is the seller
    if (!item.canEdit(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    item.status = 'sold';
    await item.save();

    // Award eco points for successful sale
    const user = await User.findById(req.user._id);
    user.ecoPoints += 5; // Award 5 points for completing a sale
    await user.save();

    res.json({
      message: "Item marked as sold successfully",
      item
    });
  } catch (error) {
    console.error("Error marking item as sold:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get marketplace categories
export const getCategories = async (req, res) => {
  try {
    const categories = [
      { value: "electronics", label: "Electronics", icon: "💻" },
      { value: "clothing", label: "Clothing & Fashion", icon: "👕" },
      { value: "home-garden", label: "Home & Garden", icon: "🏠" },
      { value: "books", label: "Books & Media", icon: "📚" },
      { value: "sports", label: "Sports & Recreation", icon: "⚽" },
      { value: "toys", label: "Toys & Games", icon: "🧸" },
      { value: "automotive", label: "Automotive", icon: "🚗" },
      { value: "art-crafts", label: "Art & Crafts", icon: "🎨" },
      { value: "eco-products", label: "Eco Products", icon: "🌱" },
      { value: "upcycled", label: "Upcycled Items", icon: "♻️" },
      { value: "organic", label: "Organic Products", icon: "🌿" },
      { value: "other", label: "Other", icon: "📦" }
    ];

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get marketplace statistics
export const getMarketplaceStats = async (req, res) => {
  try {
    const totalItems = await MarketplaceItem.countDocuments({ status: 'available' });
    const ecoFriendlyItems = await MarketplaceItem.countDocuments({ 
      status: 'available', 
      isEcoFriendly: true 
    });
    const soldItems = await MarketplaceItem.countDocuments({ status: 'sold' });
    
    const categoryStats = await MarketplaceItem.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalItems,
      ecoFriendlyItems,
      soldItems,
      ecoFriendlyPercentage: totalItems > 0 ? Math.round((ecoFriendlyItems / totalItems) * 100) : 0,
      topCategories: categoryStats
    });
  } catch (error) {
    console.error("Error fetching marketplace stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
