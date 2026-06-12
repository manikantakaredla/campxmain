import os
import re

file_path = r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the student role logic in getAnnouncements
old_student_logic = """    if (req.user.role === "student") {
      const user = await User.findById(req.user.id);
      
      if (forClass === "true") {
        query.audience = "students";
        let classOr = [];
        
        try {
          const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
          const ClassFacultyAssignment = require("../models/ClassFacultyAssignment");
          
          const proctor = await ProctorStudentAssignment.findOne({ studentId: user._id });
          const classTeacher = await ClassFacultyAssignment.findOne({ studentId: user._id });
          
          if (proctor) classOr.push({ createdBy: proctor.facultyId });
          if (classTeacher) classOr.push({ createdBy: classTeacher.facultyId });
        } catch (e) {
          console.error("Error fetching proctor/class faculty:", e);
        }
        
        if (user.branch) classOr.push({ targetDepartment: user.branch });
        if (user.currentYear) classOr.push({ targetYear: user.currentYear });
        if (user.section) classOr.push({ targetSection: user.section });
        
        if (classOr.length > 0) {
          query.$and.push({ $or: classOr });
        } else {
          query._id = null; // No class info, no class updates
        }
      } else {
        query.$and.push({
          $or: [
            { audience: "all" },
            { audience: "students" }
          ]
        });
        
        if (user.branch) {
          query.$and.push({
            $or: [
              { targetDepartment: { $exists: false } },
              { targetDepartment: null },
              { targetDepartment: user.branch }
            ]
          });
        }
        
        if (user.currentYear) {
          query.$and.push({
            $or: [
              { targetYear: { $exists: false } },
              { targetYear: null },
              { targetYear: user.currentYear }
            ]
          });
        }

        if (user.section) {
          query.$and.push({
            $or: [
              { targetSection: { $exists: false } },
              { targetSection: null },
              { targetSection: user.section }
            ]
          });
        }
      }
    } else if (req.user.role !== "admin") {"""

new_student_logic = """    if (req.user.role === "student") {
      const user = await User.findById(req.user.id);
      
      if (forClass === "true") {
        query.audience = { $in: ["students", "class", "proctor", "all"] };
        let classOr = [];
        
        try {
          const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
          const ClassFacultyAssignment = require("../models/ClassFacultyAssignment");
          
          const proctor = await ProctorStudentAssignment.findOne({ studentId: user._id });
          const classTeacher = await ClassFacultyAssignment.findOne({ studentId: user._id });
          
          if (proctor) classOr.push({ createdBy: proctor.facultyId, targetMyProctor: true });
          if (classTeacher) classOr.push({ createdBy: classTeacher.facultyId, targetMyClass: true });
        } catch (e) {
          console.error("Error fetching proctor/class faculty:", e);
        }
        
        if (classOr.length > 0) {
          query.$and.push({ $or: classOr });
        } else {
          query._id = null; // No class info, no class updates
        }
      } else {
        query.$and.push({
          $or: [
            { audience: "all" },
            { audience: "students" }
          ]
        });
        
        if (user.branch) {
          query.$and.push({
            $or: [
              { targetBranches: { $exists: false } },
              { targetBranches: { $size: 0 } },
              { targetBranches: user.branch }
            ]
          });
        }
        
        if (user.currentYear) {
          query.$and.push({
            $or: [
              { targetYears: { $exists: false } },
              { targetYears: { $size: 0 } },
              { targetYears: user.currentYear }
            ]
          });
        }

        if (user.section) {
          query.$and.push({
            $or: [
              { targetSections: { $exists: false } },
              { targetSections: { $size: 0 } },
              { targetSections: user.section }
            ]
          });
        }
      }
    } else if (req.user.role !== "admin" && req.user.role !== "management" && req.user.role !== "dean" && req.user.role !== "principal") {"""

content = content.replace(old_student_logic, new_student_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated announcementController.js getAnnouncements query")
