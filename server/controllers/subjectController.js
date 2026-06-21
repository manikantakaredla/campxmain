const Subject = require("../models/Subject");
const User = require("../models/User");
const { parseFile } = require("../utils/csvParser");

// ==================== CREATE SUBJECT ====================
exports.createSubject = async (req, res) => {
  try {
    const { name, code, department, semester, regulation, credits } = req.body;

    if (!name || !code || !department) {
      return res.status(400).json({ success: false, message: "Name, Code and Department are required" });
    }

    const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
    if (existingSubject) {
      return res.status(400).json({ success: false, message: "Subject with this code already exists" });
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      department,
      semester,
      regulation,
      credits
    });

    res.status(201).json({ success: true, message: "Subject created", subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET SUBJECTS ====================
exports.getSubjects = async (req, res) => {
  try {
    const { department, search } = req.query;
    let query = { isActive: true };

    if (department && department !== "all") {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } }
      ];
    }

    const subjects = await Subject.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE SUBJECT ====================
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, department, semester, regulation, credits, isActive } = req.body;

    const subject = await Subject.findByIdAndUpdate(
      id,
      { name, code: code?.toUpperCase(), department, semester, regulation, credits, isActive },
      { new: true, runValidators: true }
    );

    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });

    res.status(200).json({ success: true, message: "Subject updated", subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE SUBJECT ====================
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subject is assigned to any faculty
    const usersWithSubject = await User.findOne({
      $or: [
        { 'facultySubjects.primary': id },
        { 'facultySubjects.secondary': id }
      ]
    });

    if (usersWithSubject) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete subject because it is currently assigned to one or more faculty members" 
      });
    }

    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    res.status(200).json({ success: true, message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BULK ASSIGN SUBJECT TO FACULTY ====================
exports.bulkAssignSubject = async (req, res) => {
  try {
    const { subjectId, facultyIds, type } = req.body; // type = 'primary' or 'secondary'

    if (!subjectId || !facultyIds || !Array.isArray(facultyIds) || !['primary', 'secondary'].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid parameters" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });

    // Iterate through faculty and add subject to appropriate list without duplicates
    const updateKey = `facultySubjects.${type}`;
    const oppositeKey = type === 'primary' ? 'facultySubjects.secondary' : 'facultySubjects.primary';

    for (const facultyId of facultyIds) {
      const faculty = await User.findById(facultyId);
      if (!faculty) continue;

      if (!faculty.facultySubjects) {
        faculty.facultySubjects = { primary: [], secondary: [] };
      }

      // Remove from opposite list if exists
      faculty.facultySubjects[type === 'primary' ? 'secondary' : 'primary'] = 
        faculty.facultySubjects[type === 'primary' ? 'secondary' : 'primary'].filter(id => id.toString() !== subjectId);

      // Add to target list if not already there
      if (!faculty.facultySubjects[type].includes(subjectId)) {
        faculty.facultySubjects[type].push(subjectId);
      }

      await faculty.save();
    }

    res.status(200).json({ success: true, message: "Subject assigned to selected faculty" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BULK UPLOAD SUBJECTS ====================
exports.bulkUploadSubjects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { department } = req.body;
    if (!department) {
      return res.status(400).json({ success: false, message: "Department mapping is required" });
    }

    const data = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const errors = [];
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const code = row['Subject Code'] || row.code || row.Code;
        const name = row['Subject Name'] || row.name || row.Name;
        const semester = row['Semester'] || row.semester;
        const credits = row['Credits'] || row.credits;
        const regulation = row['Regulation'] || row.regulation;

        if (!code || !name) {
          throw new Error("Subject Code and Subject Name are required");
        }

        const existingSubject = await Subject.findOne({ 
          code: code.toString().trim().toUpperCase(), 
          department: department 
        });

        if (existingSubject) {
          skipCount++;
          continue; // Skip duplicate
        }

        await Subject.create({
          code: code.toString().trim().toUpperCase(),
          name: name.toString().trim(),
          department: department,
          semester: semester ? parseInt(semester) : undefined,
          credits: credits ? parseFloat(credits) : undefined,
          regulation: regulation ? regulation.toString().trim() : undefined,
        });

        successCount++;
      } catch (error) {
        errors.push({
          row: i + 2,
          message: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk subject upload completed",
      total: data.length,
      uploaded: successCount,
      skipped: skipCount,
      failed: errors.length,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
