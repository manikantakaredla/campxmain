const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Interested', 'Applied', 'Shortlisted', 'Selected', 'Rejected'], 
    default: 'Applied' 
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}, { timestamps: true });

// Unique compound index to prevent duplicate applications
applicationSchema.index({ opportunityId: 1, studentId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
