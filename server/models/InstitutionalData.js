const mongoose = require("mongoose");

// Student Institutional Data Schema
const studentDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true, unique: true, uppercase: true },  // unique creates index
  branch: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },  // unique creates index
  course: { type: String, required: true },
  ph_no: { type: String, required: true, match: /^[0-9]{10}$/ },
  isRegistered: { type: Boolean, default: false },
  registeredAt: { type: Date },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// ONLY ADDITIONAL INDEXES - NOT for roll and email (already have unique)
studentDataSchema.index({ isRegistered: 1 });
studentDataSchema.index({ branch: 1 });
studentDataSchema.index({ uploadedBy: 1 });

// Faculty Institutional Data Schema
const facultyDataSchema = new mongoose.Schema({
  empid: { type: String, required: true, unique: true, uppercase: true },  // unique creates index
  name: { type: String, required: true },
  dept: { type: String, required: true },
  designation: { type: String, required: true },
  staff_role: { 
    type: String, 
    enum: ["faculty", "hod", "deputyhod", "dean", "principal"],
    required: true 
  },
  isRegistered: { type: Boolean, default: false },
  registeredAt: { type: Date },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// ONLY ADDITIONAL INDEXES - NOT for empid (already has unique)
facultyDataSchema.index({ dept: 1 });
facultyDataSchema.index({ staff_role: 1 });
facultyDataSchema.index({ isRegistered: 1 });
facultyDataSchema.index({ uploadedBy: 1 });

const StudentData = mongoose.model("StudentData", studentDataSchema);
const FacultyData = mongoose.model("FacultyData", facultyDataSchema);

module.exports = { StudentData, FacultyData };