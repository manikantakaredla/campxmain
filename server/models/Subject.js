const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: Number
  },
  regulation: {
    type: String
  },
  credits: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

subjectSchema.index({ department: 1, isActive: 1 });
subjectSchema.index({ code: 1 });

module.exports = mongoose.model("Subject", subjectSchema);
