const mongoose = require("mongoose");

const feedbackConfigSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCollectionEnabled: {
      type: Boolean,
      default: false,
    },
    isLoginAllowed: {
      type: Boolean,
      default: false,
    },
    successMessage: {
      type: String,
      default: "Thank you! Your feedback has been successfully submitted.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedbackConfig", feedbackConfigSchema);
