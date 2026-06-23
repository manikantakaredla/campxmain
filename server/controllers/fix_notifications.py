import os
import re

file_path = r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace createNotificationsForAnnouncement
old_func_pattern = re.compile(r'// Helper function to create notifications\nasync function createNotificationsForAnnouncement\(announcement\) \{.*?\n\}\n', re.MULTILINE | re.DOTALL)

new_func = """// Helper function to create notifications
async function createNotificationsForAnnouncement(announcement) {
  try {
    let targetUsers = [];
    const User = require("../models/User");
    const ClassStudentAssignment = require("../models/ClassStudentAssignment");
    const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");

    // Get target users based on audience
    if (announcement.audience === "all") {
      targetUsers = await User.find({ isActive: true }).select("_id");
    } else if (announcement.audience === "class" || announcement.targetMyClass) {
      const assignments = await ClassStudentAssignment.find({ facultyId: announcement.createdBy }).select("studentId");
      const studentIds = assignments.map(a => a.studentId);
      targetUsers = await User.find({ _id: { $in: studentIds }, isActive: true }).select("_id");
    } else if (announcement.audience === "proctor" || announcement.targetMyProctor) {
      const assignments = await ProctorStudentAssignment.find({ facultyId: announcement.createdBy }).select("studentId");
      const studentIds = assignments.map(a => a.studentId);
      targetUsers = await User.find({ _id: { $in: studentIds }, isActive: true }).select("_id");
    } else if (announcement.audience === "students" || announcement.audience === "faculty") {
      let query = { isActive: true };
      
      if (announcement.audience === "students") {
        query.role = "student";
      } else {
        query.role = { $in: ["faculty", "hod", "dean", "principal"] };
      }
      
      // Apply branch filters
      if (announcement.targetBranches && announcement.targetBranches.length > 0) {
        query.branch = { $in: announcement.targetBranches };
        // For faculty, it's department instead of branch
        if (announcement.audience === "faculty") {
          query.department = { $in: announcement.targetBranches };
          delete query.branch;
        }
      }
      
      // Apply year filters
      if (announcement.targetYears && announcement.targetYears.length > 0) {
        query.currentYear = { $in: announcement.targetYears };
      }
      
      // Apply section filters
      if (announcement.targetSections && announcement.targetSections.length > 0) {
        query.section = { $in: announcement.targetSections };
      }
      
      targetUsers = await User.find(query).select("_id");
    }

    if (targetUsers.length > 0 && targetUsers.length < 5000) {
      const notifications = targetUsers.map(user => ({
        title: `New ${announcement.type.toUpperCase()}: ${announcement.title}`,
        message: announcement.description.substring(0, 200),
        type: "announcement",
        relatedId: announcement._id,
        targetUsers: [user._id],
        createdBy: announcement.createdBy._id || announcement.createdBy
      }));

      const Notification = require("../models/Notification");
      await Notification.insertMany(notifications);

      // Emit realtime notifications
      const { getIO } = require("../config/socket");
      const io = getIO();
      if(io) {
          targetUsers.forEach(user => {
            io.to(user._id.toString()).emit("new-notification", {
              title: `New Announcement: ${announcement.title}`,
              message: announcement.description.substring(0, 100),
              type: announcement.type
            });
          });
      }
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
}
"""

content = old_func_pattern.sub(new_func, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated createNotificationsForAnnouncement")
