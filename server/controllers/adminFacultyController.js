const User = require("../models/User");
const Subject = require("../models/Subject");
const ClassSectionAssignment = require("../models/ClassSectionAssignment");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
const ActivityLog = require("../models/ActivityLog");

// ==================== GET ALL FACULTY (WITH WORKLOAD) ====================
exports.getFacultyList = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, department, status, designation } = req.query;

    let query = { role: { $in: ["faculty", "hod", "dean"] } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (department && department !== "all") query.department = department;
    if (designation && designation !== "all") query.designation = designation;
    if (status && status !== "all") query.isActive = status === "active";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const facultyList = await User.find(query)
      .select("name employeeId department designation email phoneNumber isActive profilePicture facultySubjects")
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    // Get workload summary for each faculty
    const enrichedFacultyList = await Promise.all(facultyList.map(async (faculty) => {
      const sectionCount = await ClassSectionAssignment.countDocuments({ facultyId: faculty._id, isActive: true });
      const proctorCount = await ProctorStudentAssignment.countDocuments({ facultyId: faculty._id });

      return {
        ...faculty,
        primarySubjectCount: faculty.facultySubjects?.primary?.length || 0,
        secondarySubjectCount: faculty.facultySubjects?.secondary?.length || 0,
        assignedSectionsCount: sectionCount,
        proctorCount: proctorCount
      };
    }));

    res.status(200).json({
      success: true,
      faculty: enrichedFacultyList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET FACULTY DETAILS ====================
exports.getFacultyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await User.findById(id)
      .select("-password")
      .populate("facultySubjects.primary")
      .populate("facultySubjects.secondary")
      .lean();

    if (!faculty || !["faculty", "hod", "dean"].includes(faculty.role)) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    // Get Class Assignments
    const classAssignments = await ClassSectionAssignment.find({ facultyId: id, isActive: true });

    // Get Proctor Assignments
    const proctorAssignments = await ProctorStudentAssignment.aggregate([
      { $match: { facultyId: faculty._id } },
      { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
      {
        $group: {
          _id: { department: '$student.branch', year: '$student.currentYear', section: '$student.section' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Workload computation
    faculty.workload = {
      primarySubjectsCount: faculty.facultySubjects?.primary?.length || 0,
      secondarySubjectsCount: faculty.facultySubjects?.secondary?.length || 0,
      assignedSectionsCount: classAssignments.length,
      proctorStudentsCount: await ProctorStudentAssignment.countDocuments({ facultyId: id })
    };

    res.status(200).json({
      success: true,
      faculty,
      classAssignments,
      proctorAssignments: proctorAssignments.map(pa => ({
        department: pa._id.department,
        year: pa._id.year,
        section: pa._id.section,
        studentCount: pa.count
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE FACULTY SUBJECTS ====================
exports.updateFacultySubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const { primary, secondary } = req.body; // Arrays of Subject IDs

    const faculty = await User.findById(id);
    if (!faculty) return res.status(404).json({ success: false, message: "Faculty not found" });

    // Deduplication and overlap checks
    const pSet = new Set(primary || []);
    const sSet = new Set(secondary || []);

    const intersection = new Set([...pSet].filter(x => sSet.has(x)));
    if (intersection.size > 0) {
      return res.status(400).json({ success: false, message: "A subject cannot be both primary and secondary simultaneously" });
    }

    faculty.facultySubjects = {
      primary: Array.from(pSet),
      secondary: Array.from(sSet)
    };

    await faculty.save();

    // Log the activity
    await ActivityLog.create({
      userId: req.user.id,
      action: "UPDATED_FACULTY_SUBJECTS",
      module: "FacultyManagement",
      entityId: faculty._id,
      metadata: {
        details: `Updated subjects for faculty ${faculty.name} (${faculty.employeeId})`,
        ipAddress: req.ip
      }
    });

    res.status(200).json({ success: true, message: "Faculty subjects updated successfully", facultySubjects: faculty.facultySubjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ADMIN ANALYTICS ====================
exports.getFacultyAnalytics = async (req, res) => {
  try {
    const totalFaculty = await User.countDocuments({ role: { $in: ["faculty", "hod", "dean"] }, isActive: true });
    
    // Total subjects assigned
    const facultyWithSubjects = await User.find({ 
      role: { $in: ["faculty", "hod", "dean"] },
      $or: [
        { 'facultySubjects.primary': { $exists: true, $not: { $size: 0 } } },
        { 'facultySubjects.secondary': { $exists: true, $not: { $size: 0 } } }
      ]
    }).select('facultySubjects');

    let totalSubjectsAssigned = 0;
    facultyWithSubjects.forEach(f => {
      totalSubjectsAssigned += (f.facultySubjects?.primary?.length || 0);
      totalSubjectsAssigned += (f.facultySubjects?.secondary?.length || 0);
    });

    const totalClassSectionsAssigned = await ClassSectionAssignment.countDocuments({ isActive: true });
    const totalProctorStudentsAssigned = await ProctorStudentAssignment.countDocuments();

    // Department Breakdown
    const deptBreakdown = await User.aggregate([
      { $match: { role: { $in: ["faculty", "hod", "dean"] }, isActive: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalFaculty,
        totalSubjectsAssigned,
        totalClassSectionsAssigned,
        totalProctorStudentsAssigned,
        departmentBreakdown: deptBreakdown.filter(d => d._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
