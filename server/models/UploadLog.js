const mongoose = require("mongoose");

const uploadLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["students", "faculty", "class_assignments", "proctor_assignments"],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  totalRows: {
    type: Number,
    required: true
  },
  successRows: {
    type: Number,
    required: true
  },
  failedRows: {
    type: Number,
    required: true
  },
  errors: [{
    row: Number,
    identifier: String,
    message: String
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("UploadLog", uploadLogSchema);