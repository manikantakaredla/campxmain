const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ["Notes", "PPT", "Assignment", "Lab", "Question Bank", "Previous Papers", "Other"],
    default: "Notes"
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String
  },
  fileSize: {
    type: Number
  },
  visibility: {
    type: String,
    enum: ["all", "branch", "year", "section"],
    default: "all"
  },
  targetBranch: {
    type: String
  },
  targetYear: {
    type: Number
  },
  targetSection: {
    type: String
  },
  downloads: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "archived", "draft"],
    default: "active"
  },
  notificationsSent: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// Indexes
resourceSchema.index({ title: "text", description: "text" });
resourceSchema.index({ category: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ status: 1, downloads: -1 });
resourceSchema.index({ visibility: 1, targetBranch: 1, targetYear: 1 });
resourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Resource", resourceSchema);