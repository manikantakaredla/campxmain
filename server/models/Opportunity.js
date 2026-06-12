const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['Placement Drive', 'Internship', 'Hackathon', 'Job Opportunity', 'Workshop', 'Certification', 'Competition', 'Research Opportunity'], 
    required: true 
  },
  
  // Embedded Company Info for v1
  companyName: { type: String, required: true },
  companyLogo: { type: String },
  companyWebsite: { type: String },
  
  role: { type: String },
  package: { type: String },
  location: { type: String },
  
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  visibility: { type: String, enum: ['Public', 'Internal'], default: 'Public' },
  
  // Expanded Eligibility
  eligibility: {
    branches: [{ type: String }],
    sections: [{ type: String }],
    departments: [{ type: String }],
    years: [{ type: Number }],
    cgpa: { type: Number },
    backlogAllowed: { type: Boolean }
  },
  
  skillsRequired: [{ type: String }],
  applicationLink: { type: String },
  registrationDeadline: { type: Date },
  eventDate: { type: Date },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Closed'], default: 'Upcoming' },
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  
  // Soft Delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [{ url: String, name: String }],
  
  // Auto-Generated References
  calendarEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicActivity' },
  announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' },
  announcementGenerated: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for performance
opportunitySchema.index({ type: 1, status: 1, priority: 1, registrationDeadline: 1 });
opportunitySchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);
