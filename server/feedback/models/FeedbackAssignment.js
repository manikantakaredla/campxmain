const mongoose = require("mongoose");

const feedbackAssignmentSchema = new mongoose.Schema(
  {
    studentRollNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    facultyId: {
      type: String,
      required: true,
      trim: true,
    },
    facultyName: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    timetable: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate assignment for a student in a specific course
feedbackAssignmentSchema.index({ studentRollNo: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model("FeedbackAssignment", feedbackAssignmentSchema);
