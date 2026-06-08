const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["announcement", "resource", "activity", "assignment", "system"],
    default: "system"
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

// Indexes for efficient queries
notificationSchema.index({ targetUsers: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);