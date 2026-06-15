const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ========== COMMON FIELDS ==========
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,  // This creates index automatically
    lowercase: true,
    trim: true,
    // match: [/^[a-zA-Z0-9._%+-]+@adityauniversity\.in$/, "Please use a valid @adityauniversity.in email"]
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phoneNumber: {
    type: String,
    match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
  },
  profilePicture: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["student", "faculty", "hod", "deputyhod", "dean", "principal", "admin"],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  lastLogin: {
    type: Date
  },

  // ========== STUDENT SPECIFIC ==========
  rollNumber: {
    type: String,
    sparse: true,
    unique: true,  // This creates index automatically
    uppercase: true
  },
  course: {
    type: String,
    enum: ["B.Tech", "MBA", "MCA", "M.Tech", "BBA"]
  },
  branch: {
    type: String
  },
  section: {
    type: String,
    uppercase: true
  },
  admissionYear: { type: Number },
  studentType: { type: String, enum: ["normal", "lateral"] },
  currentYear: { type: Number, min: 1, max: 4 },
  currentSemester: { type: Number, min: 1, max: 8 },
  batch: { type: String },

  // ========== FACULTY SPECIFIC ==========
  employeeId: {
    type: String,
    sparse: true,
    unique: true,  // This creates index automatically
    uppercase: true
  },
  department: { type: String },
  designation: { type: String },
  staffRole: {
    type: String,
    enum: ["faculty", "hod", "deputyhod", "dean", "principal", "admin"]
  },
  managedBranches: {
    type: [String],
    default: []
  }

}, { 
  timestamps: true 
});

// ONLY ADDITIONAL INDEXES - NOT for fields that already have unique: true
// These are for performance queries only
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ branch: 1, role: 1 });
userSchema.index({ department: 1, role: 1 });
userSchema.index({ currentYear: 1, role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);