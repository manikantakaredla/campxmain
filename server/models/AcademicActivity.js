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
    enum: ["Workshop", "Internship", "CRT Program", "Placement Drive", "Guest Lecture", "Hackathon", "Exam Notice"],
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
  targetAudience: {
    branch: { type: String },
    year: { type: Number },
    section: { type: String }
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
  }
}, { timestamps: true });

// Auto-update status based on dates
academicActivitySchema.pre("save", function(next) {
  const now = new Date();
  if (this.endDate && now > this.endDate) {
    this.status = "completed";
  } else if (now >= this.startDate && (!this.endDate || now <= this.endDate)) {
    this.status = "ongoing";
  } else {
    this.status = "upcoming";
  }
  next();
});

// Indexes
academicActivitySchema.index({ startDate: 1 });
academicActivitySchema.index({ status: 1, startDate: 1 });
academicActivitySchema.index({ type: 1 });
academicActivitySchema.index({ createdBy: 1 });

module.exports = mongoose.model("AcademicActivity", academicActivitySchema);