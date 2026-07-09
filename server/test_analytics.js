const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Announcement = require("./models/Announcement");
require("dotenv").config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const faculty = await User.findOne({ role: "faculty" });
  if (!faculty) {
    console.log("No faculty found");
    process.exit();
  }
  console.log("Found faculty:", faculty.name, faculty._id);

  // Get items
  const announcementQuery = { createdBy: faculty._id };
  const announcements = await Announcement.find(announcementQuery)
    .select("title type createdAt viewCount")
    .sort({ createdAt: -1 })
    .lean();

  console.log("Faculty Announcements:", announcements.length);
  process.exit();
}

test();
