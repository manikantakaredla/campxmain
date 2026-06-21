const mongoose = require("mongoose");

const academicActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ["Workshop", "Internship", "CRT Program", "Placement Drive", "Guest Lecture", "Hackathon", "Exam Notice", "Event", "Sports"],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  venue: {
    type: String
  },
  inheritedAudience: {
    audienceType: { type: String, enum: ["all", "students", "faculty", "individual", "class", "proctor", "section", "department"] },
    targetBranches: [{ type: String }],
    targetSections: [{ type: String }],
    targetSpecificStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sourceAnnouncementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Announcement",
    sparse: true
  }
}, { timestamps: true });

// Auto-update status based on dates
academicActivitySchema.pre("save", function() {
  const now = new Date();
  if (this.endDate && now > this.endDate) {
    this.status = "completed";
  } else if (now >= this.startDate && (!this.endDate || now <= this.endDate)) {
    this.status = "ongoing";
  } else {
    this.status = "upcoming";
  }
});

// Indexes
academicActivitySchema.index({ startDate: 1 });
academicActivitySchema.index({ status: 1, startDate: 1 });
academicActivitySchema.index({ type: 1 });
academicActivitySchema.index({ createdBy: 1 });
academicActivitySchema.index({ "inheritedAudience.audienceType": 1, "inheritedAudience.targetBranches": 1 });
academicActivitySchema.index({ "inheritedAudience.audienceType": 1, "inheritedAudience.targetYears": 1 });
academicActivitySchema.index({ "inheritedAudience.audienceType": 1, "inheritedAudience.targetSections": 1 });

module.exports = mongoose.model("AcademicActivity", academicActivitySchema);