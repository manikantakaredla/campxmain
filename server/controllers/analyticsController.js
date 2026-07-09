const Announcement = require("../models/Announcement");
const Resource = require("../models/Resource");
const User = require("../models/User");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");

// ==================== GET ANALYTICS ITEMS ====================
exports.getAnalyticsItems = async (req, res) => {
  try {
    const userRole = req.user.role;
    let announcementQuery = {};
    let resourceQuery = {};

    const userId = req.userId || req.user.id || req.user._id;

    if (userRole === "faculty") {
      announcementQuery.createdBy = userId;
      resourceQuery.uploadedBy = userId;
    } else if (userRole === "hod") {
      const deptFaculty = await User.find({ department: req.user.department }).select("_id");
      const validIds = [...deptFaculty.map(f => f._id), userId];
      announcementQuery.createdBy = { $in: validIds };
      resourceQuery.uploadedBy = { $in: validIds };
    } 
    // Admin, Dean, Principal can see all (query remains {})

    const announcements = await Announcement.find(announcementQuery)
      .select("title type createdAt viewCount")
      .sort({ createdAt: -1 })
      .lean();

    const resources = await Resource.find(resourceQuery)
      .select("title category createdAt downloads")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      announcements: announcements.map(a => ({ ...a, itemType: "announcement" })),
      resources: resources.map(r => ({ ...r, itemType: "resource" }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET ITEM ANALYTICS DETAILS ====================
exports.getItemAnalytics = async (req, res) => {
  try {
    const { type, id } = req.params;
    let item;
    let targetUsers = [];

    const userSelect = "name rollNumber email profilePicture section branch currentYear department";

    if (type === "announcement") {
      item = await Announcement.findById(id).populate("viewedBy", userSelect);
      if (!item) return res.status(404).json({ success: false, message: "Announcement not found" });

      if (item.audience === "all") {
        targetUsers = await User.find({ role: "student", isActive: true }).select(userSelect);
      } else if (item.audience === "class" || item.targetMyClass) {
        const assignments = await ClassStudentAssignment.find({ facultyId: item.createdBy }).populate("studentId", userSelect);
        targetUsers = assignments.map(a => a.studentId).filter(s => s);
      } else if (item.audience === "proctor" || item.targetMyProctor) {
        const assignments = await ProctorStudentAssignment.find({ facultyId: item.createdBy }).populate("studentId", userSelect);
        targetUsers = assignments.map(a => a.studentId).filter(s => s);
      } else if (item.audience === "individual") {
        targetUsers = await User.find({ _id: { $in: item.targetSpecificStudents }, isActive: true }).select(userSelect);
      } else {
        // Handle department/section/year targeting
        let query = { role: "student", isActive: true };
        if (item.targetBranches && item.targetBranches.length > 0) query.branch = { $in: item.targetBranches };
        if (item.targetYears && item.targetYears.length > 0) query.currentYear = { $in: item.targetYears };
        if (item.targetSections && item.targetSections.length > 0) query.section = { $in: item.targetSections };
        if (item.targetMyDepartment) {
          const creator = await User.findById(item.createdBy);
          if (creator && creator.department) query.branch = creator.department;
        }
        targetUsers = await User.find(query).select(userSelect);
      }

    } else if (type === "resource") {
      item = await Resource.findById(id).populate("viewedBy", userSelect);
      if (!item) return res.status(404).json({ success: false, message: "Resource not found" });

      if (item.visibility === "all") {
        targetUsers = await User.find({ role: "student", isActive: true }).select(userSelect);
      } else if (item.visibility === "branch" && item.targetBranch) {
        targetUsers = await User.find({ role: "student", branch: item.targetBranch, isActive: true }).select(userSelect);
      } else if (item.visibility === "year" && item.targetYear) {
        targetUsers = await User.find({ role: "student", branch: item.targetBranch, currentYear: item.targetYear, isActive: true }).select(userSelect);
      } else if (item.visibility === "section" && item.targetSection) {
        targetUsers = await User.find({ role: "student", branch: item.targetBranch, currentYear: item.targetYear, section: item.targetSection, isActive: true }).select(userSelect);
      } else if (item.visibility === "class") {
        const assignments = await ClassStudentAssignment.find({ facultyId: item.uploadedBy }).populate("studentId", userSelect);
        targetUsers = assignments.map(a => a.studentId).filter(s => s);
      } else if (item.visibility === "proctor") {
        const assignments = await ProctorStudentAssignment.find({ facultyId: item.uploadedBy }).populate("studentId", userSelect);
        targetUsers = assignments.map(a => a.studentId).filter(s => s);
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    const viewedIds = item.viewedBy.map(u => u._id.toString());
    const viewed = item.viewedBy;
    
    // Deduplicate targetUsers
    const uniqueTargetUsers = [];
    const seenMap = new Map();
    for (const u of targetUsers) {
      if (!seenMap.has(u._id.toString())) {
        seenMap.set(u._id.toString(), true);
        uniqueTargetUsers.push(u);
      }
    }

    const pending = uniqueTargetUsers.filter(u => !viewedIds.includes(u._id.toString()));

    res.status(200).json({
      success: true,
      itemTitle: item.title,
      viewed,
      pending
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
