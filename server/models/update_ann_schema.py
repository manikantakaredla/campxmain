import os

file_path = r'c:\Users\manik\Music\campx final\server\models\Announcement.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace schema definition
new_schema = """const announcementSchema = new mongoose.Schema({
  // ========== BASIC INFO ==========
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  url: { type: String },
  
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
  
  // ========== PRIORITY & METADATA ==========
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  isImportant: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  
  // ========== AUDIENCE & TARGETING ==========
  audience: { type: String, enum: ["all", "students", "faculty", "class", "proctor"], default: "all" },
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
}, { timestamps: true });"""

import re
# Regex to find everything between `const announcementSchema = new mongoose.Schema({` and `}, { timestamps: true });`
pattern = re.compile(r'const announcementSchema = new mongoose\.Schema\(\{.*?\},\s*\{\s*timestamps:\s*true\s*\}\);', re.DOTALL)
content = pattern.sub(new_schema, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Announcement schema updated.")
