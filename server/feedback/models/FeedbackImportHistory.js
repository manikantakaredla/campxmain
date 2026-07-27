const mongoose = require("mongoose");

const feedbackImportHistorySchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rowsImported: {
      type: Number,
      default: 0,
    },
    rowsFailed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedbackImportHistory", feedbackImportHistorySchema);
