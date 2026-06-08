const { StudentData, FacultyData } = require("../models/InstitutionalData");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
const UploadLog = require("../models/UploadLog");
const User = require("../models/User");
const { parseFile } = require("../utils/csvParser");
const { validateStudentRow, validateFacultyRow } = require("../utils/fileValidator");

// ==================== UPLOAD STUDENTS (ADMIN ONLY) ====================
exports.uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    const data = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const errors = [];
    let successCount = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowErrors = validateStudentRow(row, i);
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        continue;
      }
      
      try {
        const existing = await StudentData.findOne({ $or: [{ roll: row.roll }, { email: row.email }] });
        
        if (existing) {
          errors.push({
            row: i + 2,
            identifier: row.roll,
            message: "Duplicate roll number or email"
          });
          continue;
        }
        
        await StudentData.create({
          name: row.name,
          roll: row.roll.toUpperCase(),
          branch: row.branch,
          email: row.email.toLowerCase(),
          course: row.course,
          ph_no: row.ph_no,
          uploadedBy: req.user.id
        });
        
        successCount++;
      } catch (error) {
        errors.push({
          row: i + 2,
          identifier: row.roll,
          message: error.message
        });
      }
    }
    
    await UploadLog.create({
      type: "students",
      fileName: req.file.originalname,
      totalRows: data.length,
      successRows: successCount,
      failedRows: errors.length,
      errors,
      uploadedBy: req.user.id
    });
    
    res.status(200).json({
      success: true,
      message: "Student data upload completed",
      total: data.length,
      uploaded: successCount,
      failed: errors.length,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPLOAD FACULTY (ADMIN ONLY) ====================
exports.uploadFaculty = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    const data = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const errors = [];
    let successCount = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowErrors = validateFacultyRow(row, i);
      
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        continue;
      }
      
      try {
        const existing = await FacultyData.findOne({ $or: [{ empid: row.empid }, { email: row.email }] });
        
        if (existing) {
          errors.push({
            row: i + 2,
            identifier: row.empid,
            message: "Duplicate employee ID or email"
          });
          continue;
        }
        
        await FacultyData.create({
          empid: row.empid.toUpperCase(),
          name: row.name,
          dept: row.dept,
          designation: row.designation,
          staff_role: row.staff_role.toLowerCase(),
          uploadedBy: req.user.id
        });
        
        successCount++;
      } catch (error) {
        errors.push({
          row: i + 2,
          identifier: row.empid,
          message: error.message
        });
      }
    }
    
    await UploadLog.create({
      type: "faculty",
      fileName: req.file.originalname,
      totalRows: data.length,
      successRows: successCount,
      failedRows: errors.length,
      errors,
      uploadedBy: req.user.id
    });
    
    res.status(200).json({
      success: true,
      message: "Faculty data upload completed",
      total: data.length,
      uploaded: successCount,
      failed: errors.length,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPLOAD CLASS ASSIGNMENTS (ADMIN + MANAGEMENT) ====================
exports.uploadClassAssignments = async (req, res) => {
  try {
    console.log("=== UPLOAD CLASS ASSIGNMENTS ===");
        console.log("=== UPLOAD CLASS ASSIGNMENTS ===");
    console.log("File exists?", !!req.file);
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    console.log("File name:", req.file.originalname);
    console.log("File mimetype:", req.file.mimetype);
    console.log("File size:", req.file.size);

    
    console.log("File:", req.file.originalname);
    
    const data = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    console.log("Rows parsed:", data.length);
    
    const errors = [];
    let successCount = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Get column names (case insensitive)
      const facultyId = row.FacultyEmployeeID || row.facultyemployeeid || row.FacultyEmployeeId;
      const rollNum = row.RollNumber || row.rollnumber || row.Rollnumber;
      
      if (!facultyId || !rollNum) {
        errors.push({
          row: i + 2,
          identifier: "Unknown",
          message: `Missing required columns. Found: ${Object.keys(row).join(', ')}`
        });
        continue;
      }
      
      try {
        const faculty = await User.findOne({ employeeId: facultyId.toUpperCase() });
        const student = await User.findOne({ rollNumber: rollNum.toUpperCase() });
        
        if (!faculty) {
          errors.push({ row: i + 2, identifier: facultyId, message: "Faculty not found" });
          continue;
        }
        
        if (!student) {
          errors.push({ row: i + 2, identifier: rollNum, message: "Student not found" });
          continue;
        }
        
        await ClassStudentAssignment.findOneAndUpdate(
          { facultyId: faculty._id, studentId: student._id },
          { facultyId: faculty._id, studentId: student._id, assignedBy: req.user.id },
          { upsert: true }
        );
        
        successCount++;
      } catch (error) {
        errors.push({ row: i + 2, identifier: rollNum, message: error.message });
      }
    }
    
    await UploadLog.create({
      type: "class_assignments",
      fileName: req.file.originalname,
      totalRows: data.length,
      successRows: successCount,
      failedRows: errors.length,
      errors,
      uploadedBy: req.user.id
    });
    
    res.status(200).json({
      success: true,
      message: "Class assignments completed",
      total: data.length,
      uploaded: successCount,
      failed: errors.length,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPLOAD PROCTOR ASSIGNMENTS (ADMIN + MANAGEMENT) ====================
exports.uploadProctorAssignments = async (req, res) => {
  try {
    console.log("=== UPLOAD PROCTOR ASSIGNMENTS ===");
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    console.log("File:", req.file.originalname);
    
    const data = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    console.log("Rows parsed:", data.length);
    
    const errors = [];
    let successCount = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Get column names (case insensitive)
      const facultyId = row.FacultyEmployeeID || row.facultyemployeeid || row.FacultyEmployeeId;
      const rollNum = row.RollNumber || row.rollnumber || row.Rollnumber;
      
      if (!facultyId || !rollNum) {
        errors.push({
          row: i + 2,
          identifier: "Unknown",
          message: `Missing required columns. Found: ${Object.keys(row).join(', ')}`
        });
        continue;
      }
      
      try {
        const faculty = await User.findOne({ employeeId: facultyId.toUpperCase() });
        const student = await User.findOne({ rollNumber: rollNum.toUpperCase() });
        
        if (!faculty) {
          errors.push({ row: i + 2, identifier: facultyId, message: "Faculty not found" });
          continue;
        }
        
        if (!student) {
          errors.push({ row: i + 2, identifier: rollNum, message: "Student not found" });
          continue;
        }
        
        await ProctorStudentAssignment.findOneAndUpdate(
          { facultyId: faculty._id, studentId: student._id },
          { facultyId: faculty._id, studentId: student._id, assignedBy: req.user.id },
          { upsert: true }
        );
        
        successCount++;
      } catch (error) {
        errors.push({ row: i + 2, identifier: rollNum, message: error.message });
      }
    }
    
    await UploadLog.create({
      type: "proctor_assignments",
      fileName: req.file.originalname,
      totalRows: data.length,
      successRows: successCount,
      failedRows: errors.length,
      errors,
      uploadedBy: req.user.id
    });
    
    res.status(200).json({
      success: true,
      message: "Proctor assignments completed",
      total: data.length,
      uploaded: successCount,
      failed: errors.length,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

