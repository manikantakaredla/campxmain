require('dotenv').config();
const mongoose = require('mongoose');

// Mongoose Schemas (Simplified)
const SettingSchema = new mongoose.Schema({
  branchConfigs: [{
    branch: String,
    years: mongoose.Schema.Types.Mixed
  }]
}, { strict: false });
const Setting = mongoose.model('Setting', SettingSchema, 'settings');

const UserSchema = new mongoose.Schema({
  branch: String,
  department: String,
}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

const AnnouncementSchema = new mongoose.Schema({
  targetDepartments: [String],
}, { strict: false });
const Announcement = mongoose.model('Announcement', AnnouncementSchema, 'announcements');

const ResourceSchema = new mongoose.Schema({
  targetDepartments: [String],
}, { strict: false });
const Resource = mongoose.model('Resource', ResourceSchema, 'resources');

const replacements = {
  "B.TECH COMPUTER SCIENCE AND ENGINEERING": "CSE",
  "BTECH COMPUTER SCIENCE AND ENGINEERING": "CSE",
  "COMPUTER SCIENCE ENGINEERING": "CSE",
  "COMPUTER SCIENCE AND ENGINEERING": "CSE",
  "CSE": "CSE",
  "B.TECH ELECTRONICS AND COMMUNICATION ENGINEERING": "ECE",
  "ELECTRONICS AND COMMUNICATION ENGINEERING": "ECE",
  "ECE": "ECE",
  "B.TECH INFORMATION TECHNOLOGY": "IT",
  "INFORMATION TECHNOLOGY": "IT",
  "IT": "IT",
  "MECHANICAL ENGINEERING": "MECH",
  "CIVIL ENGINEERING": "CIVIL",
  "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING": "AIML",
  "DATA SCIENCE": "DS"
};

const mapBranch = (name) => {
  if (!name) return name;
  const upper = name.toUpperCase().trim();
  for (const [key, val] of Object.entries(replacements)) {
    if (upper === key || upper.includes(key) && key.length > 5) {
      return val;
    }
  }
  return name;
};

async function fixBranches() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // 1. Settings
    const settings = await Setting.findOne();
    if (settings && settings.branchConfigs) {
      let modified = false;
      settings.branchConfigs.forEach(c => {
        const newName = mapBranch(c.branch);
        if (newName !== c.branch) {
          console.log(`Setting branch renamed: ${c.branch} -> ${newName}`);
          c.branch = newName;
          modified = true;
        }
      });
      if (modified) {
        settings.markModified('branchConfigs');
        await settings.save();
        console.log("Settings updated");
      }
    }

    // 2. Users (branch, department)
    const users = await User.find({ $or: [{ branch: { $exists: true } }, { department: { $exists: true } }] });
    let usersUpdated = 0;
    for (const u of users) {
      let mod = false;
      if (u.branch) {
        const newBranch = mapBranch(u.branch);
        if (newBranch !== u.branch) {
          u.branch = newBranch;
          mod = true;
        }
      }
      if (u.department) {
        const newDept = mapBranch(u.department);
        if (newDept !== u.department) {
          u.department = newDept;
          mod = true;
        }
      }
      if (mod) {
        await u.save();
        usersUpdated++;
      }
    }
    console.log(`Users updated: ${usersUpdated}`);

    // 3. Announcements
    const anns = await Announcement.find({ targetDepartments: { $exists: true, $not: {$size: 0} } });
    let annsUpdated = 0;
    for (const a of anns) {
      let mod = false;
      const newTargets = a.targetDepartments.map(t => {
        const mapped = mapBranch(t);
        if (mapped !== t) mod = true;
        return mapped;
      });
      if (mod) {
        a.targetDepartments = newTargets;
        await a.save();
        annsUpdated++;
      }
    }
    console.log(`Announcements updated: ${annsUpdated}`);

    // 4. Resources
    const res = await Resource.find({ targetDepartments: { $exists: true, $not: {$size: 0} } });
    let resUpdated = 0;
    for (const r of res) {
      let mod = false;
      const newTargets = r.targetDepartments.map(t => {
        const mapped = mapBranch(t);
        if (mapped !== t) mod = true;
        return mapped;
      });
      if (mod) {
        r.targetDepartments = newTargets;
        await r.save();
        resUpdated++;
      }
    }
    console.log(`Resources updated: ${resUpdated}`);

    console.log("Done");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fixBranches();
