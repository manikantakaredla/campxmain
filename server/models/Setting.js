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
  branchConfigs: {
    type: [{
      branch: String,
      years: {
        type: Map,
        of: [String],
        default: {}
      }
    }],
    default: [
      { branch: "B.Tech. - Agricultural Engineering", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Artificial Intelligence & Machine Learning (AI & ML)", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Civil Engineering", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Computer Science and Engineering", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Computer Science and Engineering - Data Science", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Information Technology", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Electrical and Electronics Engineering", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Electronics and Communication Engineering", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Mechanical Engineering", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Mining Engineering", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } },
      { branch: "B.Tech. - Petroleum Technology", years: { "1": ["A", "B", "C"], "2": ["A", "B", "C"], "3": ["A", "B", "C"], "4": ["A", "B", "C"] } }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);