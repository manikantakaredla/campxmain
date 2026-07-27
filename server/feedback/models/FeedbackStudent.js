const mongoose = require("mongoose");

const feedbackStudentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    collegeEmail: {
      type: String,
      required: true,
      lowercase: true,
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

module.exports = mongoose.model("FeedbackStudent", feedbackStudentSchema);
