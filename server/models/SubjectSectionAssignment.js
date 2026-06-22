const mongoose = require("mongoose");

const subjectSectionAssignmentSchema = new mongoose.Schema({
  department: { type: String, required: true },
  year: { type: Number, required: true },
  section: { type: String, required: true, uppercase: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true, required: true }
}, { timestamps: true });

// Partial unique index to allow soft-deleted history while guaranteeing single active assignment per subject per section
subjectSectionAssignmentSchema.index(
  { department: 1, year: 1, section: 1, subjectId: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
subjectSectionAssignmentSchema.index({ facultyId: 1, isActive: 1 });

module.exports = mongoose.model("SubjectSectionAssignment", subjectSectionAssignmentSchema);
