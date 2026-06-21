const Subject = require("../models/Subject");
const User = require("../models/User");

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
