const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: "CAMPX"
  },
  supportEmail: {
    type: String,
    default: "support@adityauniversity.in"
  },
  logoUrl: {
    type: String,
    default: ""
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  facultyRegistrationEnabled: {
    type: Boolean,
    default: true
  },
  emailDomain: {
    type: String,
    default: "@adityauniversity.in"
  },
  contactMobile: {
    type: String,
    default: ""
  },
  contactEmail: {
    type: String,
    default: ""
  },
  branches: {
    type: [String],
    default: ["CSE", "ECE", "IT", "MECH", "CIVIL"]
  },
  sections: {
    type: [String],
    default: ["A", "B", "C", "D"]
  }
}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);