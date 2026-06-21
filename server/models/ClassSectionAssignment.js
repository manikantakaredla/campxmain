const mongoose = require("mongoose");

const classSectionAssignmentSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: String, required: true }, // Normalized branch name
  year: { type: Number, required: true }, // 1, 2, 3, 4
  section: { type: String, required: true, uppercase: true },
  batch: { type: String, required: true }, // E.g. "2024-2028"
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "BatchStructure" }, // Optional future ref
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true, required: true }
}, { timestamps: true });

// Partial unique index to allow soft-deleted history while guaranteeing single active assignment
classSectionAssignmentSchema.index(
  { department: 1, year: 1, section: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
classSectionAssignmentSchema.index({ facultyId: 1, isActive: 1 });

module.exports = mongoose.model("ClassSectionAssignment", classSectionAssignmentSchema);
