import mongoose from "mongoose";

const marketplaceItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      enum: [
        "electronics", "clothing", "home-garden", "books", 
        "sports", "toys", "automotive", "art-crafts", 
        "eco-products", "upcycled", "organic", "other"
      ],
      required: true
    },
    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair", "poor"],
      required: true
    },
    images: [{
      type: String // URLs to uploaded images
    }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    location: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["available", "pending", "sold", "removed"],
      default: "available"
    },
    isEcoFriendly: {
      type: Boolean,
      default: false
    },
    ecoFeatures: [{
      type: String,
      enum: ["recycled", "organic", "biodegradable", "energy-efficient", "sustainable", "upcycled"]
    }],
    views: {
      type: Number,
      default: 0
    },
    // For favoriting items
    favoriteBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    // Negotiation and offers
    allowOffers: {
      type: Boolean,
      default: true
    },
    offers: [{
      buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      message: {
        type: String,
        maxlength: 500
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "withdrawn"],
        default: "pending"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Featured items (can be promoted for eco points)
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredUntil: {
      type: Date
    },
    // Tags for better searchability
    tags: [{
      type: String,
      trim: true
    }],
    // Shipping options
    shippingOptions: {
      pickup: {
        type: Boolean,
        default: true
      },
      delivery: {
        type: Boolean,
        default: false
      },
      shipping: {
        type: Boolean,
        default: false
      }
    },
    // Contact preferences
    contactPreferences: {
      showPhone: {
        type: Boolean,
        default: false
      },
      showEmail: {
        type: Boolean,
        default: true
      },
      messagesOnly: {
        type: Boolean,
        default: false
      }
    }
  },
  { 
    timestamps: true,
    // Add text index for search functionality
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
marketplaceItemSchema.index({ category: 1, status: 1 });
marketplaceItemSchema.index({ seller: 1, status: 1 });
marketplaceItemSchema.index({ location: 1, status: 1 });
marketplaceItemSchema.index({ price: 1, status: 1 });
marketplaceItemSchema.index({ createdAt: -1 });
marketplaceItemSchema.index({ isFeatured: -1, createdAt: -1 });

// Text index for search
marketplaceItemSchema.index({ 
  title: "text", 
  description: "text", 
  tags: "text" 
});

// Virtual for offer count
marketplaceItemSchema.virtual('offerCount').get(function() {
  return this.offers ? this.offers.filter(offer => offer.status === 'pending').length : 0;
});

// Method to check if user can edit this item
marketplaceItemSchema.methods.canEdit = function(userId) {
  return this.seller.toString() === userId.toString();
};

// Method to increment views
marketplaceItemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

const MarketplaceItem = mongoose.model("MarketplaceItem", marketplaceItemSchema);

export default MarketplaceItem;
