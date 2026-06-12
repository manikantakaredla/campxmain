const User = require("../models/User");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");

// ==================== GET CLASS STUDENTS ====================
exports.getClassStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    // Get all class assignments for this faculty
    const assignments = await ClassStudentAssignment.find({ 
      facultyId: req.user.id 
    }).select("studentId");
    
    const studentIds = assignments.map(a => a.studentId);
    
    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        students: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 }
      });
    }
    
    let query = { _id: { $in: studentIds }, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find(query)
      .select("name email rollNumber branch section course phoneNumber profilePicture currentYear currentSemester")
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get class students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ALL DEPARTMENT STUDENTS ====================
exports.getAllDepartmentStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const user = await User.findById(req.user.id);
    
    // We allow matching either exact abbreviation or full name if there's confusion (e.g. CSE vs Computer Science)
    let branchQuery = user.department;
    if (user.department === 'CSE' || user.department === 'Computer Science') {
      branchQuery = { $in: ['CSE', 'Computer Science'] };
    } else if (user.department === 'ECE' || user.department === 'Electronics and Communication Engineering') {
      branchQuery = { $in: ['ECE', 'Electronics and Communication Engineering'] };
    }

    let query = { role: "student", branch: branchQuery, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } }
      ];
    }
    
    const students = await User.find(query)
      .select("-password")
      .sort({ currentYear: -1, section: 1, rollNumber: 1 });
      
    res.status(200).json({
      success: true,
      students
    });
  } catch (error) {
    console.error("Get all department students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ALL ASSIGNED STUDENTS ====================
exports.getAllAssignedStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    // Get class assignments
    const classAssignments = await ClassStudentAssignment.find({ 
      facultyId: req.user.id 
    }).select("studentId");
    
    // Get proctor assignments
    const proctorAssignments = await ProctorStudentAssignment.find({ 
      facultyId: req.user.id 
    }).select("studentId");
    
    const allIds = [...classAssignments.map(a => a.studentId.toString()), ...proctorAssignments.map(a => a.studentId.toString())];
    const studentIds = [...new Set(allIds)];
    
    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        students: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 }
      });
    }
    
    let query = { _id: { $in: studentIds }, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find(query)
      .select("name email rollNumber branch section course phoneNumber profilePicture currentYear currentSemester")
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get all assigned students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET PROCTOR STUDENTS ====================
exports.getProctorStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    // Get all proctor assignments for this faculty
    const assignments = await ProctorStudentAssignment.find({ 
      facultyId: req.user.id 
    }).select("studentId");
    
    const studentIds = assignments.map(a => a.studentId);
    
    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        students: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 }
      });
    }
    
    let query = { _id: { $in: studentIds }, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find(query)
      .select("name email rollNumber branch section course phoneNumber profilePicture currentYear currentSemester")
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get proctor students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== SEARCH STUDENTS ====================
exports.searchStudents = async (req, res) => {
  try {
    const { q, type = "all" } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }
    
    // Get faculty's assigned students
    const classAssignments = await ClassStudentAssignment.find({ 
      facultyId: req.user.id 
    }).select("studentId");
    
    const proctorAssignments = await ProctorStudentAssignment.find({ 
      facultyId: req.user.id 
    }).select("studentId");
    
    let assignedStudentIds = classAssignments.map(a => a.studentId.toString());
    
    if (type === "proctor") {
      assignedStudentIds = proctorAssignments.map(a => a.studentId.toString());
    } else if (type === "class") {
      assignedStudentIds = classAssignments.map(a => a.studentId.toString());
    } else {
      // Merge both
      const allIds = [...classAssignments.map(a => a.studentId.toString()), ...proctorAssignments.map(a => a.studentId.toString())];
      assignedStudentIds = [...new Set(allIds)];
    }
    
    if (assignedStudentIds.length === 0) {
      return res.status(200).json({
        success: true,
        students: []
      });
    }
    
    const students = await User.find({
      _id: { $in: assignedStudentIds },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { rollNumber: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    }).select("name email rollNumber branch section course phoneNumber profilePicture");
    
    res.status(200).json({
      success: true,
      students
    });
  } catch (error) {
    console.error("Search students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET STUDENT DETAIL ====================
exports.getStudentDetail = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if student is assigned to this faculty
    const isClassAssigned = await ClassStudentAssignment.findOne({
      facultyId: req.user.id,
      studentId
    });
    
    const isProctorAssigned = await ProctorStudentAssignment.findOne({
      facultyId: req.user.id,
      studentId
    });
    
    if (!isClassAssigned && !isProctorAssigned && req.user.role === "faculty") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this student's details"
      });
    }
    
    const student = await User.findById(studentId)
      .select("-password");
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Get faculty info
    const classFaculty = await ClassStudentAssignment.findOne({ studentId })
      .populate("facultyId", "name employeeId department designation");
    
    const proctorFaculty = await ProctorStudentAssignment.findOne({ studentId })
      .populate("facultyId", "name employeeId department designation");
    
    res.status(200).json({
      success: true,
      student,
      assignments: {
        classFaculty: classFaculty?.facultyId || null,
        proctorFaculty: proctorFaculty?.facultyId || null
      }
    });
  } catch (error) {
    console.error("Get student detail error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};