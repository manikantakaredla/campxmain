const mongoose = require("mongoose");

const proctorStudentAssignmentSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// Ensure unique assignment (compound unique index)
proctorStudentAssignmentSchema.index({ facultyId: 1, studentId: 1 }, { unique: true });
// Additional indexes
proctorStudentAssignmentSchema.index({ facultyId: 1 });
proctorStudentAssignmentSchema.index({ studentId: 1 });

module.exports = mongoose.model("ProctorStudentAssignment", proctorStudentAssignmentSchema);