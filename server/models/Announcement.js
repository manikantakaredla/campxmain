const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  role: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  // ========== BASIC INFO ==========
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  url: { type: String },
  
  // ========== TYPE/CATEGORY ==========
  type: {
    type: String,
    enum: [
      "academic", "assignment", "internal_exam", "external_exam", 
      "workshop", "seminar", "hackathon", "internship", 
      "placement", "event", "general", "examination", 
      "holiday", "emergency", "fee", "lab", "sports", 
      "result", "crt", "exam"
    ],
    default: "general",
    required: true
  },
  
  // ========== PRIORITY & METADATA ==========
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  isImportant: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  showInClassUpdates: { type: Boolean, default: false },
  allowReadTracking: { type: Boolean, default: false },
  
  // ========== AUDIENCE & TARGETING ==========
  audience: { type: String, enum: ["all", "students", "faculty", "class", "proctor", "individual"], default: "all" },
  targetMyClass: { type: Boolean, default: false },
  targetMyProctor: { type: Boolean, default: false },
  targetMySection: { type: Boolean, default: false },
  targetMyDepartment: { type: Boolean, default: false },
  targetBranches: [{ type: String }],
  targetSections: [{ type: String }],
  targetYears: [{ type: Number }],
  targetSpecificStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // ========== ATTACHMENT ==========
  attachment: { type: String },
  attachmentType: { type: String, enum: ["image", "pdf"] },
  
  // ========== CONTACTS ==========
  contacts: [contactSchema],
  
  // ========== LOCATION & DATES ==========
  location: { type: String },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  scheduledPublishDate: { type: Date },
  
  // ========== EVENT SPECIFIC ==========
  eventDate: { type: Date },
  eventVenue: { type: String },
  registrationLink: { type: String },
  registrationDeadline: { type: Date },
  
  // ========== FEE SPECIFIC ==========
  feeAmount: { type: Number },
  feeLastDate: { type: Date },
  
  // ========== REMINDERS ==========
  sendReminder: { type: Boolean, default: false },
  reminderDays: [{ type: Number }],
  
  // ========== METRICS/ANALYTICS ==========
  readCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  
  // ========== SYSTEM FIELDS ==========
  tags: [{ type: String }],
  status: { type: String, enum: ["active", "expired", "draft"], default: "active" },
  calendarEventCreated: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

// Indexes
announcementSchema.index({ title: "text", description: "text" });
announcementSchema.index({ createdBy: 1, createdAt: -1 });
announcementSchema.index({ status: 1, priority: -1 });
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ status: 1, createdAt: -1 });
announcementSchema.index({ type: 1 });
announcementSchema.index({ audience: 1, status: 1 });
announcementSchema.index({ targetBranches: 1 });
announcementSchema.index({ targetYears: 1 });
announcementSchema.index({ targetSections: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);