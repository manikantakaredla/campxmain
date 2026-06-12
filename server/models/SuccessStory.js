const mongoose = require("mongoose");

const successStorySchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  companyName: { type: String, required: true },
  package: { type: String },
  batch: { type: String },
  story: { type: String, required: true },
  linkedin: { type: String },
  photo: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model("SuccessStory", successStorySchema);
