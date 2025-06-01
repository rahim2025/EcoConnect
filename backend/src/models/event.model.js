import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    category: {
      type: String,
      enum: ["cleanup", "recycling", "tree-planting", "conservation", "education", "energy", "other"],
      default: "other"
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming"
    },
    maxParticipants: {
      type: Number,
      default: 0  // 0 means unlimited
    },
    ecoPoints: {
      type: Number,
      default: 25  // Points awarded for participation
    }
  },
  { timestamps: true }
);

// Virtual field to get participant count
eventSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Method to check if event is full
eventSchema.methods.isFull = function() {
  return this.maxParticipants > 0 && this.participants.length >= this.maxParticipants;
};

const Event = mongoose.model("Event", eventSchema);

export default Event;
