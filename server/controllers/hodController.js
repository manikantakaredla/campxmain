const User = require("../models/User");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ClassSectionAssignment = require("../models/ClassSectionAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const { getIO } = require("../config/socket");

// ==================== GET DEPARTMENT FACULTY ====================
exports.getDepartmentFaculty = async (req, res) => {
  try {
    // Get HOD's department
    const hod = await User.findById(req.user.id);
    
    let query = {
      role: { $in: ["faculty", "hod", "deputyhod", "dean", "principal"] },
      isActive: true
    };

    if (hod.role !== "admin") {
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
      query.department = { $in: branches };
    }

    const faculty = await User.find(query).select("name email employeeId department designation staffRole profilePicture");

    res.status(200).json({
      success: true,
      department: hod.department || "All",
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
    let query = { 
      role: "student",
      isActive: true 
    };

    if (hod.role !== "admin") {
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
      query.branch = { $in: branches };
    }
    
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
      department: hod.department || "All",
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
    
    if (hod.role !== "admin" && faculty.department !== hod.department) {
      return res.status(403).json({
        success: false,
        message: "You can only assign faculty from your department"
      });
    }
    
    let studentQuery = { _id: { $in: studentIds } };
    if (hod.role !== "admin") studentQuery.branch = hod.department;
    
    const validStudents = await User.find(studentQuery);
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
    
    if (hod.role !== "admin" && faculty.department !== hod.department) {
      return res.status(403).json({
        success: false,
        message: "You can only assign faculty from your department"
      });
    }
    
    let studentQuery = { _id: { $in: studentIds } };
    if (hod.role !== "admin") studentQuery.branch = hod.department;
    
    const validStudents = await User.find(studentQuery);
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
      if (hod.role !== "admin" && faculty.department !== hod.department) {
        return res.status(403).json({
          success: false,
          message: "You can only view faculty from your department"
        });
      }
      query.facultyId = facultyId;
    } else if (hod.role !== "admin") {
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
      if (hod.role !== "admin" && faculty.department !== hod.department) {
        return res.status(403).json({
          success: false,
          message: "You can only view faculty from your department"
        });
      }
      query.facultyId = facultyId;
    } else if (hod.role !== "admin") {
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
    
    if (hod.role !== "admin" && assignment.studentId.branch !== hod.department) {
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
    
    if (hod.role !== "admin" && assignment.studentId.branch !== hod.department) {
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

// ==================== GET SECTION ASSIGNMENTS ====================
exports.getSectionAssignments = async (req, res) => {
  try {
    const { facultyId } = req.query;
    const hod = await User.findById(req.user.id);
    
    let branches = [];
    if (["dean", "principal", "management", "admin"].includes(hod.role)) {
        branches = hod.managedBranches && hod.managedBranches.length > 0 ? hod.managedBranches : [hod.department].filter(Boolean);
    } else {
        branches = [hod.department].filter(Boolean);
    }

    if (branches.length === 0 && hod.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Department/Branches not assigned to your profile"
      });
    }

    let query = { isActive: true };
    if (hod.role !== "admin") {
        query.department = { $in: branches };
    }
    
    if (facultyId) query.facultyId = facultyId;

    const assignments = await ClassSectionAssignment.find(query)
      .populate("facultyId", "name employeeId profilePicture department email")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    // Calculate students count dynamically
    const sectionsWithCounts = await Promise.all(assignments.map(async (assignment) => {
      const studentCount = await User.countDocuments({
        branch: assignment.department,
        currentYear: assignment.year,
        section: assignment.section,
        role: "student",
        isActive: true
      });
      return {
        ...assignment.toObject(),
        studentCount
      };
    }));

    res.status(200).json({
      success: true,
      assignments: sectionsWithCounts,
      total: sectionsWithCounts.length
    });
  } catch (error) {
    console.error("Get section assignments error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ASSIGNMENT PREVIEW ====================
exports.getAssignmentPreview = async (req, res) => {
  try {
    const { department, facultyId, year, sections } = req.body;
    
    if (!department || !facultyId || !year || !sections || !sections.length) {
      return res.status(400).json({
        success: false,
        message: "Department, facultyId, year, and sections are required"
      });
    }

    // Workload of target faculty
    const currentAssignments = await ClassSectionAssignment.find({
      facultyId,
      isActive: true
    });

    const targetFaculty = await User.findById(facultyId).select("name employeeId department");

    // Check ownership of selected sections
    const sectionPreviews = await Promise.all(sections.map(async (section) => {
      const existingAssignment = await ClassSectionAssignment.findOne({
        department,
        year,
        section: section.toUpperCase(),
        isActive: true
      }).populate("facultyId", "name employeeId");

      const studentCount = await User.countDocuments({
        branch: department,
        currentYear: year,
        section: section.toUpperCase(),
        role: "student",
        isActive: true
      });

      return {
        section: section.toUpperCase(),
        studentCount,
        currentlyAssignedTo: existingAssignment ? existingAssignment.facultyId : null,
        isReassignment: !!existingAssignment && existingAssignment.facultyId._id.toString() !== facultyId
      };
    }));

    res.status(200).json({
      success: true,
      targetFaculty,
      currentWorkload: currentAssignments.length,
      sectionPreviews
    });
  } catch (error) {
    console.error("Get assignment preview error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ASSIGN SECTION ====================
exports.assignSection = async (req, res) => {
  try {
    const { department, facultyId, year, sections } = req.body;
    
    if (!department || !facultyId || !year || !sections || !sections.length) {
      return res.status(400).json({
        success: false,
        message: "Department, facultyId, year, and sections are required"
      });
    }

    const hod = await User.findById(req.user.id);
    const faculty = await User.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    // Resolve batch string
    let batchString = "Unknown";
    const sampleStudent = await User.findOne({
      branch: department,
      currentYear: year,
      role: "student"
    });
    if (sampleStudent && sampleStudent.batch) {
      batchString = sampleStudent.batch;
    } else {
      const currentCalendarYear = new Date().getFullYear();
      batchString = `${currentCalendarYear - year + 1}-${currentCalendarYear - year + 5}`; // Rough guess
    }

    const results = [];
    const io = getIO();

    for (const section of sections) {
      const upperSection = section.toUpperCase();
      const existingAssignment = await ClassSectionAssignment.findOne({
        department,
        year,
        section: upperSection,
        isActive: true
      }).populate("facultyId", "name");

      if (existingAssignment) {
        if (existingAssignment.facultyId._id.toString() === facultyId) {
          results.push({ section: upperSection, success: true, message: "Already assigned to this faculty" });
          continue;
        }

        // Soft delete existing
        existingAssignment.isActive = false;
        await existingAssignment.save();

        await ActivityLog.create({
          user: req.user.id,
          action: "REASSIGN_SECTION",
          details: `Reassigned ${department} Year ${year} Section ${upperSection} from ${existingAssignment.facultyId.name} to ${faculty.name}`
        });

        await Notification.create({
          title: "Class Reassigned",
          message: `Section ${upperSection} (Year ${year}, ${department}) has been reassigned to another faculty.`,
          type: "assignment",
          targetUsers: [existingAssignment.facultyId._id],
          createdBy: req.user.id
        });
      }

      const newAssignment = await ClassSectionAssignment.create({
        facultyId,
        department,
        year,
        section: upperSection,
        batch: batchString,
        assignedBy: req.user.id,
        isActive: true
      });

      // Notify students of new assignment
      const sectionStudents = await User.find({
        branch: department,
        currentYear: year,
        section: upperSection,
        role: "student",
        isActive: true
      }).select("_id");

      const studentIds = sectionStudents.map(s => s._id);

      if (studentIds.length > 0) {
        await Notification.create({
          title: "Class Faculty Assigned",
          message: `You have been assigned to ${faculty.name} as your class faculty for Section ${upperSection}`,
          type: "assignment",
          targetUsers: studentIds,
          createdBy: req.user.id
        });

        if (io) {
          studentIds.forEach(id => {
            io.to(id.toString()).emit("new-notification", {
              title: "Class Faculty Assigned",
              message: `You have been assigned to ${faculty.name} as your class faculty for Section ${upperSection}`
            });
          });
        }
      }

      // Notify new faculty
      await Notification.create({
        title: "New Class Section Assigned",
        message: `You have been assigned as class faculty for ${department} Year ${year} Section ${upperSection}.`,
        type: "assignment",
        targetUsers: [facultyId],
        createdBy: req.user.id
      });

      results.push({ section: upperSection, success: true, message: "Assigned successfully" });
    }

    res.status(200).json({
      success: true,
      message: "Section assignments completed",
      results
    });
  } catch (error) {
    console.error("Assign section error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== BULK REASSIGN SECTION ====================
exports.bulkReassignSection = async (req, res) => {
  try {
    const { sourceFacultyId, targetFacultyId, sections } = req.body;
    
    if (!sourceFacultyId || !targetFacultyId || !sections || !sections.length) {
      return res.status(400).json({
        success: false,
        message: "Source faculty, target faculty, and sections are required"
      });
    }

    const targetFaculty = await User.findById(targetFacultyId);
    if (!targetFaculty) {
      return res.status(404).json({ success: false, message: "Target faculty not found" });
    }

    const io = getIO();
    const results = [];

    for (const item of sections) {
      const { department, year, section } = item;
      
      const existingAssignment = await ClassSectionAssignment.findOne({
        facultyId: sourceFacultyId,
        department,
        year,
        section: section.toUpperCase(),
        isActive: true
      });

      if (!existingAssignment) {
        results.push({ department, year, section, success: false, message: "Not assigned to source faculty" });
        continue;
      }

      existingAssignment.isActive = false;
      await existingAssignment.save();

      await ClassSectionAssignment.create({
        facultyId: targetFacultyId,
        department,
        year,
        section: section.toUpperCase(),
        batch: existingAssignment.batch,
        assignedBy: req.user.id,
        isActive: true
      });

      results.push({ department, year, section, success: true, message: "Reassigned successfully" });
    }

    // Single notification to target faculty
    await Notification.create({
      title: "Multiple Sections Reassigned to You",
      message: `You have been reassigned ${results.filter(r => r.success).length} sections.`,
      type: "assignment",
      targetUsers: [targetFacultyId],
      createdBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: "Bulk reassignment completed",
      results
    });
  } catch (error) {
    console.error("Bulk reassign section error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE SECTION ASSIGNMENT ====================
exports.deleteSectionAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await ClassSectionAssignment.findById(id).populate("facultyId", "name");
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
    
    assignment.isActive = false;
    await assignment.save();
    
    await ActivityLog.create({
      user: req.user.id,
      action: "DELETE_SECTION_ASSIGNMENT",
      details: `Removed assignment for ${assignment.department} Year ${assignment.year} Section ${assignment.section} from ${assignment.facultyId?.name}`
    });
    
    res.status(200).json({
      success: true,
      message: "Section assignment removed successfully"
    });
  } catch (error) {
    console.error("Delete section assignment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};