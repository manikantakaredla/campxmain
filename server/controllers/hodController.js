const User = require("../models/User");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");

// ==================== GET DEPARTMENT FACULTY ====================
exports.getDepartmentFaculty = async (req, res) => {
  try {
    // Get HOD's department
    const hod = await User.findById(req.user.id);
    
    let branches = [];
    if (["dean", "principal", "management"].includes(hod.role)) {
        branches = hod.managedBranches && hod.managedBranches.length > 0 ? hod.managedBranches : [hod.department].filter(Boolean);
    } else {
        branches = [hod.department].filter(Boolean);
    }

    if (branches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Department/Branches not assigned to your profile"
      });
    }

    const faculty = await User.find({
      department: { $in: branches },
      role: { $in: ["faculty", "hod", "deputyhod", "dean", "principal"] },
      isActive: true
    }).select("name email employeeId department designation staffRole profilePicture");

    res.status(200).json({
      success: true,
      department,
      faculty,
      total: faculty.length
    });
  } catch (error) {
    console.error("Get department faculty error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET DEPARTMENT STUDENTS ====================
exports.getDepartmentStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, section, year } = req.query;
    
    const hod = await User.findById(req.user.id);
    let branches = [];
    if (["dean", "principal", "management"].includes(hod.role)) {
        branches = hod.managedBranches && hod.managedBranches.length > 0 ? hod.managedBranches : [hod.department].filter(Boolean);
    } else {
        branches = [hod.department].filter(Boolean);
    }

    if (branches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Department/Branches not assigned to your profile"
      });
    }

    let query = { 
      branch: { $in: branches }, 
      role: "student",
      isActive: true 
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    if (section) {
      query.section = section.toUpperCase();
    }
    
    if (year) {
      query.currentYear = parseInt(year);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find(query)
      .select("name email rollNumber branch section course phoneNumber profilePicture currentYear currentSemester")
      .sort({ rollNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    // Get assignment counts for each student
    const studentsWithAssignments = await Promise.all(students.map(async (student) => {
      const classFaculty = await ClassStudentAssignment.findOne({ studentId: student._id })
        .populate("facultyId", "name employeeId");
      
      const proctorFaculty = await ProctorStudentAssignment.findOne({ studentId: student._id })
        .populate("facultyId", "name employeeId");
      
      return {
        ...student.toObject(),
        hasClassFaculty: !!classFaculty,
        hasProctorFaculty: !!proctorFaculty,
        classFacultyName: classFaculty?.facultyId?.name || null,
        proctorFacultyName: proctorFaculty?.facultyId?.name || null
      };
    }));
    
    res.status(200).json({
      success: true,
      department,
      students: studentsWithAssignments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get department students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ASSIGN CLASS STUDENTS ====================
exports.assignClassStudents = async (req, res) => {
  try {
    const { facultyId, studentIds } = req.body;
    
    if (!facultyId || !studentIds || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Faculty ID and student IDs are required"
      });
    }
    
    // Verify faculty belongs to same department
    const faculty = await User.findById(facultyId);
    const hod = await User.findById(req.user.id);
    
    if (faculty.department !== hod.department) {
      return res.status(403).json({
        success: false,
        message: "You can only assign faculty from your department"
      });
    }
    
    const validStudents = await User.find({
      _id: { $in: studentIds },
      branch: hod.department
    });
    const validStudentIds = validStudents.map(s => s._id);
    const validIdsStr = validStudentIds.map(id => id.toString());
    
    const results = studentIds.map(id => ({
      studentId: id,
      success: validIdsStr.includes(id.toString()),
      message: validIdsStr.includes(id.toString()) ? "Assigned successfully" : "Student not found or not in your department"
    }));

    if (validStudentIds.length > 0) {
      const bulkOps = validStudentIds.map(studentId => ({
        updateOne: {
          filter: { facultyId, studentId },
          update: { facultyId, studentId, assignedBy: req.user.id },
          upsert: true
        }
      }));
      await ClassStudentAssignment.bulkWrite(bulkOps);

      await Notification.create({
        title: "Class Faculty Assigned",
        message: `You have been assigned to ${faculty.name} as your class faculty`,
        type: "assignment",
        targetUsers: validStudentIds,
        createdBy: req.user.id
      });

      const io = getIO();
      if (io) {
        validStudentIds.forEach(studentId => {
          io.to(studentId.toString()).emit("new-notification", {
            title: "Class Faculty Assigned",
            message: `You have been assigned to ${faculty.name} as your class faculty`
          });
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Class assignments completed",
      results
    });
  } catch (error) {
    console.error("Assign class students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ASSIGN PROCTOR STUDENTS ====================
exports.assignProctorStudents = async (req, res) => {
  try {
    const { facultyId, studentIds } = req.body;
    
    if (!facultyId || !studentIds || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Faculty ID and student IDs are required"
      });
    }
    
    const faculty = await User.findById(facultyId);
    const hod = await User.findById(req.user.id);
    
    if (faculty.department !== hod.department) {
      return res.status(403).json({
        success: false,
        message: "You can only assign faculty from your department"
      });
    }
    
    const validStudents = await User.find({
      _id: { $in: studentIds },
      branch: hod.department
    });
    const validStudentIds = validStudents.map(s => s._id);
    const validIdsStr = validStudentIds.map(id => id.toString());
    
    const results = studentIds.map(id => ({
      studentId: id,
      success: validIdsStr.includes(id.toString()),
      message: validIdsStr.includes(id.toString()) ? "Assigned successfully" : "Student not found or not in your department"
    }));

    if (validStudentIds.length > 0) {
      const bulkOps = validStudentIds.map(studentId => ({
        updateOne: {
          filter: { facultyId, studentId },
          update: { facultyId, studentId, assignedBy: req.user.id },
          upsert: true
        }
      }));
      await ProctorStudentAssignment.bulkWrite(bulkOps);

      await Notification.create({
        title: "Proctor Faculty Assigned",
        message: `You have been assigned to ${faculty.name} as your proctor faculty`,
        type: "assignment",
        targetUsers: validStudentIds,
        createdBy: req.user.id
      });

      const io = getIO();
      if (io) {
        validStudentIds.forEach(studentId => {
          io.to(studentId.toString()).emit("new-notification", {
            title: "Proctor Faculty Assigned",
            message: `You have been assigned to ${faculty.name} as your proctor faculty`
          });
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Proctor assignments completed",
      results
    });
  } catch (error) {
    console.error("Assign proctor students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET CLASS ASSIGNMENTS ====================
exports.getClassAssignments = async (req, res) => {
  try {
    const { facultyId } = req.query;
    const hod = await User.findById(req.user.id);
    
    let query = {};
    
    if (facultyId) {
      const faculty = await User.findById(facultyId);
      if (faculty.department !== hod.department) {
        return res.status(403).json({
          success: false,
          message: "You can only view faculty from your department"
        });
      }
      query.facultyId = facultyId;
    } else {
      // Get all faculty in department
      const facultyList = await User.find({ 
        department: hod.department,
        role: { $in: ["faculty", "hod", "deputyhod", "dean", "principal"] }
      }).select("_id");
      query.facultyId = { $in: facultyList.map(f => f._id) };
    }
    
    const assignments = await ClassStudentAssignment.find(query)
      .populate("facultyId", "name employeeId department")
      .populate("studentId", "name rollNumber branch section email")
      .sort({ createdAt: -1 });
    
    // Group by faculty
    const groupedByFaculty = {};
    assignments.forEach(assignment => {
      const facultyId = assignment.facultyId._id.toString();
      if (!groupedByFaculty[facultyId]) {
        groupedByFaculty[facultyId] = {
          faculty: assignment.facultyId,
          students: []
        };
      }
      groupedByFaculty[facultyId].students.push(assignment.studentId);
    });
    
    res.status(200).json({
      success: true,
      assignments: groupedByFaculty,
      total: assignments.length
    });
  } catch (error) {
    console.error("Get class assignments error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET PROCTOR ASSIGNMENTS ====================
exports.getProctorAssignments = async (req, res) => {
  try {
    const { facultyId } = req.query;
    const hod = await User.findById(req.user.id);
    
    let query = {};
    
    if (facultyId) {
      const faculty = await User.findById(facultyId);
      if (faculty.department !== hod.department) {
        return res.status(403).json({
          success: false,
          message: "You can only view faculty from your department"
        });
      }
      query.facultyId = facultyId;
    } else {
      const facultyList = await User.find({ 
        department: hod.department,
        role: { $in: ["faculty", "hod", "deputyhod", "dean", "principal"] }
      }).select("_id");
      query.facultyId = { $in: facultyList.map(f => f._id) };
    }
    
    const assignments = await ProctorStudentAssignment.find(query)
      .populate("facultyId", "name employeeId department")
      .populate("studentId", "name rollNumber branch section email")
      .sort({ createdAt: -1 });
    
    const groupedByFaculty = {};
    assignments.forEach(assignment => {
      const facultyId = assignment.facultyId._id.toString();
      if (!groupedByFaculty[facultyId]) {
        groupedByFaculty[facultyId] = {
          faculty: assignment.facultyId,
          students: []
        };
      }
      groupedByFaculty[facultyId].students.push(assignment.studentId);
    });
    
    res.status(200).json({
      success: true,
      assignments: groupedByFaculty,
      total: assignments.length
    });
  } catch (error) {
    console.error("Get proctor assignments error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== REMOVE CLASS ASSIGNMENT ====================
exports.removeClassAssignment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const hod = await User.findById(req.user.id);
    
    const assignment = await ClassStudentAssignment.findOne({ studentId })
      .populate("studentId");
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
    
    if (assignment.studentId.branch !== hod.department) {
      return res.status(403).json({
        success: false,
        message: "You can only remove assignments for students in your department"
      });
    }
    
    await assignment.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Class assignment removed successfully"
    });
  } catch (error) {
    console.error("Remove class assignment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== REMOVE PROCTOR ASSIGNMENT ====================
exports.removeProctorAssignment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const hod = await User.findById(req.user.id);
    
    const assignment = await ProctorStudentAssignment.findOne({ studentId })
      .populate("studentId");
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
    
    if (assignment.studentId.branch !== hod.department) {
      return res.status(403).json({
        success: false,
        message: "You can only remove assignments for students in your department"
      });
    }
    
    await assignment.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Proctor assignment removed successfully"
    });
  } catch (error) {
    console.error("Remove proctor assignment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};