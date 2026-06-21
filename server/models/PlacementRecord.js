const mongoose = require("mongoose");

const placementRecordSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  package: { type: Number, required: true },
  rollNumber: { type: String, required: true },
  studentName: { type: String, required: true },
  
  // Deep linking to CAMPX users
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  gender: { type: String },
  college: { type: String },
  mobileNumber: { type: String },
  email: { type: String },
  role: { type: String },
  placementYear: { type: Number, required: true },
  department: { type: String },
  batch: { type: String },
  
  offerType: { type: String, enum: ['Placement', 'Internship', 'PPO'], required: true },
  offerStatus: { type: String, enum: ['Selected', 'Joined', 'Rejected', 'Pending'] },
  offerDate: { type: Date },
  
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Prevent duplicate placement uploads based on exact match of specific fields
placementRecordSchema.index(
  { rollNumber: 1, companyName: 1, role: 1, package: 1 }, 
  { unique: true }
);

placementRecordSchema.index({ placementYear: 1 });
placementRecordSchema.index({ department: 1, placementYear: 1 });
placementRecordSchema.index({ companyName: 1 });
placementRecordSchema.index({ studentName: 1 });

module.exports = mongoose.model("PlacementRecord", placementRecordSchema);
