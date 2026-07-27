const mongoose = require("mongoose");

const feedbackAnswerSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedbackSubmission",
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    facultyId: {
      type: String,
      required: true,
    },
    facultyName: {
      type: String,
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    timetable: {
      type: String,
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FeedbackQuestion",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
      }
    ],
    suggestions: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedbackAnswer", feedbackAnswerSchema);
