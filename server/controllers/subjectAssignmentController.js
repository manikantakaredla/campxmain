const SubjectSectionAssignment = require("../models/SubjectSectionAssignment");
const User = require("../models/User");
const Subject = require("../models/Subject");

// GET /admin/sections/:department/:year/:section/subjects
exports.getSectionSubjects = async (req, res) => {
  try {
    const { department, year, section } = req.params;
    
    const assignments = await SubjectSectionAssignment.find({
      department,
      year: parseInt(year),
      section: section.toUpperCase(),
      isActive: true
    })
      .populate("subjectId", "name code")
      .populate("facultyId", "name email employeeId department")
      .lean();
      
    res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error("Error fetching section subjects:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /admin/sections/assign-subject
exports.assignSubjectFaculty = async (req, res) => {
  try {
    const { department, year, section, subjectId, facultyId } = req.body;
    
    if (!department || !year || !section || !subjectId || !facultyId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Inactivate existing active assignment for this exact subject & section
    await SubjectSectionAssignment.updateMany(
      {
        department,
        year: parseInt(year),
        section: section.toUpperCase(),
        subjectId,
        isActive: true
      },
      { isActive: false }
    );

    // Create new assignment
    const assignment = new SubjectSectionAssignment({
      department,
      year: parseInt(year),
      section: section.toUpperCase(),
      subjectId,
      facultyId,
      assignedBy: req.user.id,
      isActive: true
    });

    await assignment.save();
    
    const populated = await SubjectSectionAssignment.findById(assignment._id)
      .populate("subjectId", "name code")
      .populate("facultyId", "name email employeeId department");

    res.status(200).json({ 
      success: true, 
      message: "Faculty assigned to subject successfully",
      assignment: populated
    });
  } catch (error) {
    console.error("Error assigning subject faculty:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /admin/subjects/:subjectId/faculty
exports.getFacultyBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    // Find all faculty members whose primary or secondary subjects include this subjectId
    const faculties = await User.find({
      role: { $in: ["faculty", "hod", "deputyhod", "dean", "principal"] },
      isActive: true,
      $or: [
        { "facultySubjects.primary": subjectId },
        { "facultySubjects.secondary": subjectId }
      ]
    }).select("name email employeeId department facultySubjects").lean();

    res.status(200).json({ success: true, faculties });
  } catch (error) {
    console.error("Error fetching faculty by subject:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /admin/subjects/department/:department/year/:year
exports.getSubjectsByDepartmentAndYear = async (req, res) => {
  try {
    const { department, year } = req.params;
    // Let's assume year corresponds roughly to semesters: Year 1 = Sem 1,2; Year 2 = Sem 3,4...
    // Or we just return all active subjects for the department since year mapping might be complex
    // If semester mapping exists we could filter, otherwise return all for department.
    const subjects = await Subject.find({
      department,
      isActive: true
    }).select("name code semester credits").sort({ semester: 1, name: 1 }).lean();
    
    // Simple filter by year if semester logic applies
    // year 1 -> sem 1, 2
    // year 2 -> sem 3, 4
    // year 3 -> sem 5, 6
    // year 4 -> sem 7, 8
    const parsedYear = parseInt(year);
    const validSemesters = [(parsedYear * 2) - 1, parsedYear * 2];
    
    const filteredSubjects = subjects.filter(sub => validSemesters.includes(sub.semester));
    
    // Fallback to all department subjects if filtering drops everything (in case semesters aren't set)
    if (filteredSubjects.length === 0 && subjects.length > 0) {
      res.status(200).json({ success: true, subjects });
    } else {
      res.status(200).json({ success: true, subjects: filteredSubjects.length > 0 ? filteredSubjects : subjects });
    }
    
  } catch (error) {
    console.error("Error fetching subjects by dept/year:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
