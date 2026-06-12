const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  sections: [{
    name: { type: String, required: true, uppercase: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  hod: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Branch", branchSchema);