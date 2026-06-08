const mongoose = require("mongoose");

const classStudentAssignmentSchema = new mongoose.Schema({
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
classStudentAssignmentSchema.index({ facultyId: 1, studentId: 1 }, { unique: true });
// Additional indexes
classStudentAssignmentSchema.index({ facultyId: 1 });
classStudentAssignmentSchema.index({ studentId: 1 });

module.exports = mongoose.model("ClassStudentAssignment", classStudentAssignmentSchema);