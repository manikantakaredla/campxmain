const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  role: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  // ========== BASIC INFO ==========
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // ========== TYPE/CATEGORY ==========
  type: {
    type: String,
    enum: [
      "exam", "workshop", "internship", "hackathon", 
      "placement", "crt", "sports", "fee", "lab", 
      "academic", "event", "general", "holiday", "result"
    ],
    default: "general",
    required: true
  },
  
  // ========== PRIORITY ==========
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  
  // ========== AUDIENCE ==========
  audience: {
    type: String,
    enum: ["all", "students", "faculty"],
    default: "all"
  },
  
  // ========== ATTACHMENT ==========
  attachment: {
    type: String  // Supabase URL
  },
  attachmentType: {
    type: String,
    enum: ["image", "pdf"]
  },
  
  // ========== CONTACTS ==========
  contacts: [contactSchema],
  
  // ========== LOCATION ==========
  location: {
    type: String
  },
  
  // ========== DATES ==========
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  
  // ========== FEE SPECIFIC (Only for type="fee") ==========
  feeAmount: {
    type: Number
  },
  feeLastDate: {
    type: Date
  },
  
  // ========== EVENT SPECIFIC (Only for types that need registration) ==========
  eventDate: {
    type: Date
  },
  eventVenue: {
    type: String
  },
  registrationLink: {
    type: String
  },
  
  // ========== TAGS ==========
  tags: [{
    type: String
  }],
  
  // ========== SYSTEM FIELDS ==========
  status: {
    type: String,
    enum: ["active", "expired", "draft"],
    default: "active"
  },
  calendarEventCreated: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// Indexes
announcementSchema.index({ title: "text", description: "text" });
announcementSchema.index({ createdBy: 1, createdAt: -1 });
announcementSchema.index({ status: 1, priority: -1 });
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ type: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);