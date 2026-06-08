const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ["registration", "forgot_password"],
    default: "registration"
  },
  registrationData: {
    type: Object,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// TTL index for auto-deletion
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Index for faster lookups
otpSchema.index({ email: 1, otp: 1 });
otpSchema.index({ purpose: 1 });

module.exports = mongoose.model("OTP", otpSchema);