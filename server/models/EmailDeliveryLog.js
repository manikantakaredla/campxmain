const mongoose = require("mongoose");

const emailDeliveryLogSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
    required: true
  },
  category: {
    type: String,
    required: true
  },
  totalRecipients: {
    type: Number,
    required: true,
    default: 0
  },
  delivered: {
    type: Number,
    default: 0
  },
  failed: {
    type: Number,
    default: 0
  },
  failedEmails: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending"
  }
}, { timestamps: true });

emailDeliveryLogSchema.index({ notificationId: 1 });
emailDeliveryLogSchema.index({ status: 1 });
emailDeliveryLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("EmailDeliveryLog", emailDeliveryLogSchema);
