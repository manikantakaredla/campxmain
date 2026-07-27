const mongoose = require("mongoose");

const feedbackQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      enum: ["scale", "textarea"],
      required: true,
      default: "scale",
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    scaleMax: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedbackQuestion", feedbackQuestionSchema);
