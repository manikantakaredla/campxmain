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
    enum: ["Notes", "PPT", "Assignment", "Lab", "Question Bank", "Previous Papers", "Previous Paper", "Lab Manual", "Syllabus", "Video Link", "Other"],
    default: "Notes"
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject"
  },
  subjectName: {
    type: String
  },
  department: {
    type: String
  },
  semester: {
    type: Number
  },
  resourceType: {
    type: String,
    enum: ["Notes", "PPT", "Assignment", "Question Bank", "Previous Paper", "Lab Manual", "Syllabus", "Video Link", "Other"],
    default: "Notes"
  },
  unitNumber: {
    type: Number
  },
  approvalStatus: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "approved"
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
resourceSchema.index({ subjectId: 1 });
resourceSchema.index({ resourceType: 1 });
resourceSchema.index({ approvalStatus: 1 });
resourceSchema.index({ department: 1, semester: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ status: 1, downloads: -1 });
resourceSchema.index({ visibility: 1, targetBranch: 1, targetYear: 1, targetSection: 1 });
resourceSchema.index({ status: 1, createdAt: -1 });
resourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Resource", resourceSchema);