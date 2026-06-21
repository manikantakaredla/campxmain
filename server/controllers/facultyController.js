const User = require("../models/User");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
const ClassSectionAssignment = require("../models/ClassSectionAssignment");

// ==================== GET CLASS ASSIGNMENTS SUMMARY ====================
exports.getClassAssignmentsSummary = async (req, res) => {
  try {
    const facultyId = req.user.id;
    
    const sections = await ClassSectionAssignment.find({ facultyId, isActive: true });
    
    const indAssignments = await ClassStudentAssignment.find({ facultyId }).select("studentId");
    const indStudentIds = indAssignments.map(a => a.studentId.toString());
    
    const sectionQueries = sections.map(sa => ({
      branch: sa.department,
      currentYear: sa.year,
      section: sa.section
    }));
    
    let query = { isActive: true, role: "student" };
    if (indStudentIds.length > 0 && sectionQueries.length > 0) {
      query.$or = [
        { _id: { $in: indStudentIds } },
        { $or: sectionQueries }
      ];
    } else if (indStudentIds.length > 0) {
      query._id = { $in: indStudentIds };
    } else if (sectionQueries.length > 0) {
      query.$or = sectionQueries;
    } else {
      return res.status(200).json({
        success: true,
        summary: {
          totalSections: 0,
          totalStudents: 0,
          sections: []
        }
      });
    }

    const uniqueStudentCount = await User.countDocuments(query);
    
    const sectionList = await Promise.all(sections.map(async (sa) => {
      const count = await User.countDocuments({
        branch: sa.department,
        currentYear: sa.year,
        section: sa.section,
        isActive: true,
        role: "student"
      });
      return {
        department: sa.department,
        year: sa.year,
        section: sa.section,
        batch: sa.batch,
        studentCount: count
      };
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalSections: sections.length,
        totalStudents: uniqueStudentCount,
        sections: sectionList
      }
    });
  } catch (error) {
    console.error("Get class assignments summary error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET CLASS STUDENTS ====================
exports.getClassStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, branch, year, section } = req.query;
    
    // Get individual assignments
    const indAssignments = await ClassStudentAssignment.find({ facultyId: req.user.id }).select("studentId");
    const indStudentIds = indAssignments.map(a => a.studentId.toString());

    // Get section assignments
    const sectionAssignments = await ClassSectionAssignment.find({ facultyId: req.user.id, isActive: true });
    const sectionQueries = sectionAssignments.map(sa => ({
      branch: sa.department,
      currentYear: sa.year,
      section: sa.section
    }));

    // Build query base for students
    let baseQuery = { isActive: true, role: "student" };
    if (indStudentIds.length > 0 && sectionQueries.length > 0) {
      baseQuery.$or = [
        { _id: { $in: indStudentIds } },
        { $or: sectionQueries }
      ];
    } else if (indStudentIds.length > 0) {
      baseQuery._id = { $in: indStudentIds };
    } else if (sectionQueries.length > 0) {
      baseQuery.$or = sectionQueries;
    } else {
      return res.status(200).json({
        success: true,
        students: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 }
      });
    }
    
    // Start building final query with filters
    let query = { $and: [baseQuery] };
    
    if (search) {
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { rollNumber: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      });
    }
    
    if (branch) query.$and.push({ branch });
    if (year) query.$and.push({ currentYear: parseInt(year) });
    if (section) query.$and.push({ section: section.toUpperCase() });
    
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
    
    // class assignments
    const classAssignments = await ClassStudentAssignment.find({ facultyId: req.user.id }).select("studentId");
    
    // proctor assignments
    const proctorAssignments = await ProctorStudentAssignment.find({ facultyId: req.user.id }).select("studentId");

    // section assignments
    const sectionAssignments = await ClassSectionAssignment.find({ facultyId: req.user.id, isActive: true });
    
    const allIds = [...classAssignments.map(a => a.studentId.toString()), ...proctorAssignments.map(a => a.studentId.toString())];
    const studentIds = [...new Set(allIds)];
    
    const sectionQueries = sectionAssignments.map(sa => ({
      branch: sa.department,
      currentYear: sa.year,
      section: sa.section
    }));

    let baseQuery = { isActive: true, role: "student" };
    if (studentIds.length > 0 && sectionQueries.length > 0) {
      baseQuery.$or = [
        { _id: { $in: studentIds } },
        { $or: sectionQueries }
      ];
    } else if (studentIds.length > 0) {
      baseQuery._id = { $in: studentIds };
    } else if (sectionQueries.length > 0) {
      baseQuery.$or = sectionQueries;
    } else {
      return res.status(200).json({
        success: true,
        students: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 }
      });
    }
    
    let query = { $and: [baseQuery] };
    if (search) {
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { rollNumber: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      });
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
    
    const assignments = await ProctorStudentAssignment.find({ facultyId: req.user.id }).select("studentId");
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
    
    const classAssignments = await ClassStudentAssignment.find({ facultyId: req.user.id }).select("studentId");
    const proctorAssignments = await ProctorStudentAssignment.find({ facultyId: req.user.id }).select("studentId");
    const sectionAssignments = await ClassSectionAssignment.find({ facultyId: req.user.id, isActive: true });
    
    let indIds = [];
    if (type === "proctor") {
      indIds = proctorAssignments.map(a => a.studentId.toString());
    } else if (type === "class") {
      indIds = classAssignments.map(a => a.studentId.toString());
    } else {
      const allIds = [...classAssignments.map(a => a.studentId.toString()), ...proctorAssignments.map(a => a.studentId.toString())];
      indIds = [...new Set(allIds)];
    }

    const sectionQueries = (type === "all" || type === "class") ? sectionAssignments.map(sa => ({
      branch: sa.department,
      currentYear: sa.year,
      section: sa.section
    })) : [];
    
    let baseQuery = { isActive: true, role: "student" };
    if (indIds.length > 0 && sectionQueries.length > 0) {
      baseQuery.$or = [
        { _id: { $in: indIds } },
        { $or: sectionQueries }
      ];
    } else if (indIds.length > 0) {
      baseQuery._id = { $in: indIds };
    } else if (sectionQueries.length > 0) {
      baseQuery.$or = sectionQueries;
    } else {
      return res.status(200).json({
        success: true,
        students: []
      });
    }
    
    const students = await User.find({
      $and: [
        baseQuery,
        {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { rollNumber: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } }
          ]
        }
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
    
    const student = await User.findById(studentId).select("-password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    
    const isClassAssigned = await ClassStudentAssignment.findOne({ facultyId: req.user.id, studentId });
    const isProctorAssigned = await ProctorStudentAssignment.findOne({ facultyId: req.user.id, studentId });
    const isSectionAssigned = await ClassSectionAssignment.findOne({
      facultyId: req.user.id,
      department: student.branch,
      year: student.currentYear,
      section: student.section,
      isActive: true
    });
    
    if (!isClassAssigned && !isProctorAssigned && !isSectionAssigned && req.user.role === "faculty") {
      return res.status(403).json({ success: false, message: "You are not authorized to view this student's details" });
    }
    
    const classFaculty = await ClassStudentAssignment.findOne({ studentId }).populate("facultyId", "name employeeId department designation");
    let resolvedClassFaculty = classFaculty?.facultyId || null;

    if (!resolvedClassFaculty) {
      const sectionFaculty = await ClassSectionAssignment.findOne({
        department: student.branch,
        year: student.currentYear,
        section: student.section,
        isActive: true
      }).populate("facultyId", "name employeeId department designation");
      resolvedClassFaculty = sectionFaculty?.facultyId || null;
    }

    const proctorFaculty = await ProctorStudentAssignment.findOne({ studentId }).populate("facultyId", "name employeeId department designation");
    
    res.status(200).json({
      success: true,
      student,
      assignments: {
        classFaculty: resolvedClassFaculty,
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