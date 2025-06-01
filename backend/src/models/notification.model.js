import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,      enum: [
        "follow", "like", "comment", "share", "system", "admin-alert", 
        "warning", "info", "critical", "event_invite", "eco_points", 
        "badge_purchase", "event_cancel", "event_update", "event_join", 
        "event_leave", "post_report", "post_hidden", "post_deleted", 
        "event_status_change", "points_earned", "reward_redeemed", "marketplace_offer"
      ],
      required: true,    },
    isSystemNotification: {
      type: Boolean,
      default: false
    },
    isAdminNotification: {
      type: Boolean,
      default: false
    },    content: {
      type: String,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    marketplaceItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceItem",
    },
    comment: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
