const mongoose = require("mongoose");

const interviewExperienceSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  year: { type: Number, required: true },
  isAnonymous: { type: Boolean, default: false },
  
  // Approval Workflow
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  
  rounds: [{ 
    roundNumber: Number, 
    roundName: String, 
    details: String 
  }],
  
  experience: { type: String },
  tips: { type: String },
  difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

interviewExperienceSchema.index({ companyName: 1, year: 1, status: 1 });

module.exports = mongoose.model("InterviewExperience", interviewExperienceSchema);
