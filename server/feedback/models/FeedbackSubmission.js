const mongoose = require("mongoose");

const feedbackSubmissionSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    clientIp: {
      type: String,
    },
    userAgent: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedbackSubmission", feedbackSubmissionSchema);
