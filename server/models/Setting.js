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
  }
}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);