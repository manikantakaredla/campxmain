const mongoose = require("mongoose");

const savedOpportunitySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  savedAt: { type: Date, default: Date.now }
});

// Unique index to prevent duplicate saves
savedOpportunitySchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model("SavedOpportunity", savedOpportunitySchema);
