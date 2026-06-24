const crypto = require('crypto');
const Announcement = require("../models/Announcement");
const notificationService = require("../services/notificationService");
const AcademicActivity = require("../models/AcademicActivity");
const User = require("../models/User");
const { getIO } = require("../config/socket");
const supabase = require("../config/supabase");

// Types that should create calendar events
const CALENDAR_TYPES = [
  "exam", "workshop", "internship", "hackathon", 
  "placement", "crt", "sports", "event"
];

// Helper function to create calendar event from announcement
async function createCalendarEventFromAnnouncement(announcement) {
  try {
    const typeMapping = {
      exam: "Exam Notice",
      workshop: "Workshop",
      internship: "Internship",
      hackathon: "Hackathon",
      placement: "Placement Drive",
      crt: "CRT Program",
      sports: "Sports",
      event: "Event"
    };

    const activityType = typeMapping[announcement.type] || "Workshop";
    const eventStartDate = announcement.eventDate || announcement.startDate;

    const existingActivity = await AcademicActivity.findOne({
      sourceAnnouncementId: announcement._id
    });

    let activity = existingActivity;

    if (!existingActivity) {
      let inheritedAudience = {
        audienceType: announcement.audience,
        targetBranches: announcement.targetBranches || [],
        targetYears: announcement.targetYears || [],
        targetSections: announcement.targetSections || [],
        targetSpecificStudents: announcement.targetSpecificStudents || []
      };

      if (announcement.targetMyClass) inheritedAudience.audienceType = "class";
      else if (announcement.targetMyProctor) inheritedAudience.audienceType = "proctor";
      else if (announcement.targetMySection) inheritedAudience.audienceType = "section";
      else if (announcement.targetMyDepartment) inheritedAudience.audienceType = "department";

      activity = await AcademicActivity.create({
        title: announcement.title,
        description: announcement.description,
        type: activityType,
        startDate: eventStartDate,
        endDate: announcement.expiryDate || null,
        venue: announcement.eventVenue || announcement.location || null,
        status: "upcoming",
        createdBy: announcement.createdBy,
        sourceAnnouncementId: announcement._id,
        inheritedAudience
      });
      console.log(`✅ Calendar event created for announcement: ${announcement.title}`);
    } else {
      console.log(`⚠️ Duplicate calendar event detected, skipping creation for: ${announcement.title}`);
    }

    announcement.calendarEventCreated = true;
    await announcement.save();

    return activity;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return null;
  }
}

// Helper function to create notifications
async function createNotificationsForAnnouncement(announcement) {
  try {
    let targetUsers = [];

    if (announcement.audience === "all") {
      targetUsers = await User.find({ isActive: true }).select("_id");
    } 
    else if (announcement.audience === "class" || announcement.targetMyClass) {
      const ClassStudentAssignment = require("../models/ClassStudentAssignment");
      const assignments = await ClassStudentAssignment.find({ facultyId: announcement.createdBy._id || announcement.createdBy }).select("studentId");
      const studentIds = assignments.map(a => a.studentId);
      targetUsers = await User.find({ _id: { $in: studentIds }, isActive: true }).select("_id");
    } 
    else if (announcement.audience === "proctor" || announcement.targetMyProctor) {
      const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
      const assignments = await ProctorStudentAssignment.find({ facultyId: announcement.createdBy._id || announcement.createdBy }).select("studentId");
      const studentIds = assignments.map(a => a.studentId);
      targetUsers = await User.find({ _id: { $in: studentIds }, isActive: true }).select("_id");
    } 
    else if (announcement.audience === "individual") {
      targetUsers = await User.find({ _id: { $in: announcement.targetSpecificStudents }, isActive: true }).select("_id");
    } 
    else if (announcement.audience === "students" || announcement.audience === "faculty") {
      let query = { isActive: true };
      
      if (announcement.audience === "students") {
        query.role = "student";
      } else {
        query.role = { $in: ["faculty", "hod", "dean", "principal"] };
      }
      
      if (announcement.targetBranches && announcement.targetBranches.length > 0) {
        query.branch = { $in: announcement.targetBranches };
        if (announcement.audience === "faculty") {
          query.department = { $in: announcement.targetBranches };
          delete query.branch;
        }
      }
      
      if (announcement.targetMySection) {
         const creator = await User.findById(announcement.createdBy._id || announcement.createdBy);
         if (creator && creator.section) query.section = creator.section;
      } else if (announcement.targetMyDepartment) {
         const creator = await User.findById(announcement.createdBy._id || announcement.createdBy);
         if (creator && creator.department) query.branch = creator.department;
      }
      
      if (announcement.targetYears && announcement.targetYears.length > 0) {
        query.currentYear = { $in: announcement.targetYears };
      }
      
      if (announcement.targetSections && announcement.targetSections.length > 0) {
        query.section = { $in: announcement.targetSections };
      }
      
      targetUsers = await User.find(query).select("_id");
    }

    if (targetUsers.length > 0 && targetUsers.length < 5000) {
      const notifications = targetUsers.map(user => ({
        title: `New ${announcement.type.toUpperCase()}: ${announcement.title}`,
        message: announcement.description.substring(0, 200),
        type: "announcement",
        relatedId: announcement._id,
        targetUsers: [user._id],
        createdBy: announcement.createdBy._id || announcement.createdBy
      }));

      await notificationService.createBulkNotifications(notifications);
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
}

// Add these new functions after existing ones

// Get ONLY class teacher announcements
exports.getClassTeacherAnnouncements = async (req, res) => {
  try {
    const studentId = req.user.id;
    const ClassStudentAssignment = require("../models/ClassStudentAssignment");
    
    const classAssignment = await ClassStudentAssignment.findOne({ studentId }).populate("facultyId");
    
    if (!classAssignment?.facultyId) {
      return res.status(200).json({
        success: true,
        announcements: []
      });
    }
    
    const announcements = await Announcement.find({
      createdBy: classAssignment.facultyId._id,
      status: "active"
    })
    .populate("createdBy", "name email role profilePicture")
    .sort({ priority: -1, createdAt: -1 })
    .limit(parseInt(req.query.limit) || 50)
    .lean();
    
    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get ONLY proctor announcements
exports.getProctorAnnouncements = async (req, res) => {
  try {
    const studentId = req.user.id;
    const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
    
    const proctorAssignment = await ProctorStudentAssignment.findOne({ studentId }).populate("facultyId");
    
    if (!proctorAssignment?.facultyId) {
      return res.status(200).json({
        success: true,
        announcements: []
      });
    }
    
    const announcements = await Announcement.find({
      createdBy: proctorAssignment.facultyId._id,
      status: "active"
    })
    .populate("createdBy", "name email role profilePicture")
    .sort({ priority: -1, createdAt: -1 })
    .limit(parseInt(req.query.limit) || 50)
    .lean();
    
    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// ==================== SEARCH STUDENTS ====================
exports.searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, students: [] });
    }
    
    const User = require("../models/User");
    const regex = new RegExp(q, "i");
    
    const students = await User.find({
      role: "student",
      $or: [
        { name: regex },
        { employeeId: regex }, // Roll number
        { email: regex }
      ]
    })
    .select("name employeeId email branch currentYear section profilePicture")
    .limit(20);
    
    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PREVIEW RECIPIENTS ====================
exports.previewRecipients = async (req, res) => {
  try {
    const { audience, targetBranches, targetYears, targetSections, targetSpecificStudents } = req.body;
    const User = require("../models/User");
    
    let query = { isActive: true };
    let studentCount = 0;
    let facultyCount = 0;

    if (audience === "all") {
      studentCount = await User.countDocuments({ ...query, role: "student" });
      facultyCount = await User.countDocuments({ ...query, role: { $in: ["faculty", "hod", "dean"] } });
    } else if (audience === "faculty") {
      if (targetBranches && targetBranches.length > 0) {
        query.department = { $in: targetBranches };
      }
      facultyCount = await User.countDocuments({ ...query, role: { $in: ["faculty", "hod", "dean"] } });
    } else if (audience === "students") {
      query.role = "student";
      if (targetBranches && targetBranches.length > 0) query.branch = { $in: targetBranches };
      if (targetYears && targetYears.length > 0) query.currentYear = { $in: targetYears };
      if (targetSections && targetSections.length > 0) query.section = { $in: targetSections };
      studentCount = await User.countDocuments(query);
    } else if (audience === "individual") {
      if (targetSpecificStudents && targetSpecificStudents.length > 0) {
        studentCount = await User.countDocuments({ _id: { $in: targetSpecificStudents }, role: "student" });
      }
    }
    
    res.status(200).json({
      success: true,
      counts: {
        students: studentCount,
        faculty: facultyCount,
        total: studentCount + facultyCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CREATE ANNOUNCEMENT ====================
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      audience,
      contacts,
      location,
      startDate,
      expiryDate,
      tags,
      targetDepartment: _targetDepartment,
      targetYear,
      targetSection,
      feeAmount,
      feeLastDate,
      eventDate,
      eventVenue,
      registrationLink,
      url,
      targetBranches,
      targetYears,
      targetSections,
      targetMyClass,
      targetMyProctor,
      targetMySection,
      targetMyDepartment,
      addToCalendar,
      isImportant,
      isPinned,
      sendReminder,
      status,
      targetSpecificStudents,
      showInClassUpdates,
      allowReadTracking,
      sendNotification
    } = req.body;

    let attachment = null;
    let attachmentType = null;

    if (req.file) {
      const fileName = `announcements/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${req.file.originalname}`;
      const { error } = await supabase.storage
        .from("campx-files")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload attachment: " + error.message
        });
      }

      const { data: publicUrl } = supabase.storage
        .from("campx-files")
        .getPublicUrl(fileName);

      attachment = publicUrl.publicUrl;
      attachmentType = req.file.mimetype.startsWith("image/") ? "image" : "pdf";
    }

    let targetDepartment = _targetDepartment;
    let parsedContacts = contacts;
    if (typeof contacts === "string") {
      parsedContacts = JSON.parse(contacts);
    }

    const currentUser = await User.findById(req.user.id);

    // Permission Check: Prevent faculty from making university-wide announcements
    if (audience === "all" && !["admin", "management"].includes(currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create university-wide announcements."
      });
    }

    // Parse targeting arrays
    let parsedTargetBranches = [];
    let parsedTargetYears = [];
    let parsedTargetSections = [];
    let parsedTargetSpecificStudents = [];
    
    if (targetSpecificStudents) {
      try {
        parsedTargetSpecificStudents = typeof targetSpecificStudents === 'string' ? JSON.parse(targetSpecificStudents) : targetSpecificStudents;
      } catch(e) { parsedTargetSpecificStudents = []; }
    }
    
    if (targetBranches) {
      try {
        parsedTargetBranches = typeof targetBranches === 'string' ? JSON.parse(targetBranches) : targetBranches;
      } catch(e) { parsedTargetBranches = []; }
    }
    if (targetYears) {
      try {
        parsedTargetYears = typeof targetYears === 'string' ? JSON.parse(targetYears) : targetYears;
      } catch(e) { parsedTargetYears = []; }
    }
    if (targetSections) {
      try {
        parsedTargetSections = typeof targetSections === 'string' ? JSON.parse(targetSections) : targetSections;
      } catch(e) { parsedTargetSections = []; }
    }
    
    // Enforcement: Faculty & HOD are restricted to their own department
    if (["faculty", "hod"].includes(currentUser.role)) {
      if (currentUser.department) {
        parsedTargetBranches = [currentUser.department];
        targetDepartment = currentUser.department;
      }
    }

    // Build announcement data
    const announcementData = {
      title,
      description,
      type: type || "general",
      priority: priority || "medium",
      audience: audience || "all",
      attachment,
      attachmentType,
      url: url || null,
      contacts: parsedContacts || [],
      location: location || null,
      startDate: startDate || new Date(),
      expiryDate: expiryDate || null,
      tags: tags || [],
      createdBy: req.user.id,
      status: "active",
      targetMyClass: targetMyClass === 'true' || targetMyClass === true,
      targetMyProctor: targetMyProctor === 'true' || targetMyProctor === true,
      targetMySection: targetMySection === 'true' || targetMySection === true,
      targetMyDepartment: targetMyDepartment === 'true' || targetMyDepartment === true,
      targetBranches: parsedTargetBranches,
      targetYears: parsedTargetYears,
      targetSections: parsedTargetSections,
      targetSpecificStudents: parsedTargetSpecificStudents,
      isImportant: isImportant === 'true' || isImportant === true,
      isPinned: isPinned === 'true' || isPinned === true,
      sendReminder: sendReminder === 'true' || sendReminder === true,
      showInClassUpdates: showInClassUpdates === 'true' || showInClassUpdates === true,
      allowReadTracking: allowReadTracking === 'true' || allowReadTracking === true,
      status: status || "active"
    };

    if (type === "fee") {
      announcementData.feeAmount = feeAmount ? parseFloat(feeAmount) : null;
      announcementData.feeLastDate = feeLastDate || null;
    }

    if (["exam", "workshop", "internship", "hackathon", "placement", "crt", "sports", "event"].includes(type)) {
      announcementData.eventDate = eventDate || startDate || new Date();
      announcementData.eventVenue = eventVenue || location || null;
      announcementData.registrationLink = registrationLink || null;
    }

    const announcement = await Announcement.create(announcementData);
    await announcement.populate("createdBy", "name email role");

    if (CALENDAR_TYPES.includes(announcement.type) || addToCalendar === 'true' || addToCalendar === true) {
      await createCalendarEventFromAnnouncement(announcement);
    }

    const shouldSendNotification = sendNotification !== 'false' && sendNotification !== false;
    if (announcementData.status === "active" && shouldSendNotification) {
      await createNotificationsForAnnouncement(announcement);
    }

    const io = getIO();
    io.emit("new-announcement", announcement);

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ALL ANNOUNCEMENTS ====================
exports.getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, priority, search, status = "active", type, forClass } = req.query;
    
    let query = { status };
    
    if (priority && priority !== "all") {
      query.priority = priority;
    }
    
    if (type && type !== "all") {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (!query.$and) query.$and = [];

    // ========== CLASS UPDATES FILTER (for students) ==========
  // Find this section (around line 180-230) and replace it:

// ========== CLASS UPDATES FILTER (for students) ==========
if (forClass === "true" && req.user.role === "student") {
  const studentId = req.user.id;
  const user = await User.findById(studentId);
  
  const ClassStudentAssignment = require("../models/ClassStudentAssignment");
  const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
  
  const classAssignment = await ClassStudentAssignment.findOne({ studentId }).populate("facultyId");
  const proctorAssignment = await ProctorStudentAssignment.findOne({ studentId }).populate("facultyId");
  
  const assignedFacultyIds = [];
  if (classAssignment?.facultyId) assignedFacultyIds.push(classAssignment.facultyId._id);
  if (proctorAssignment?.facultyId) assignedFacultyIds.push(proctorAssignment.facultyId._id);
  
  // MODIFIED: Only show announcements from class teacher and proctor
  // Remove all other filters like targetSection, targetBranches, etc.
  query.$and.push({
    $or: [
      { createdBy: { $in: assignedFacultyIds } },  // Only class teacher & proctor
      // Remove these lines to exclude section/branch/year announcements:
      // { targetSection: user?.section },
      // { targetMyClass: true },
      // { targetMyProctor: true },
      // { targetMySection: true },
      // { targetMyDepartment: true },
      // { audience: "my_class" },
      // { audience: "my_proctor" },
      // { audience: "my_section" },
      // { audience: "my_department" },
      // { targetBranches: user?.branch },
      // { targetDepartment: user?.branch }
    ]
  });
}
    // ========== REGULAR STUDENT FILTER ==========
    else if (req.user.role === "student") {
      const user = await User.findById(req.user.id);
      
      query.$and.push({
        $or: [
          { audience: "all" },
          { audience: "students" },
          { audience: "individual", targetSpecificStudents: user._id }
        ]
      });
      
      if (user.branch) {
        query.$and.push({
          $or: [
            { targetBranches: { $exists: false } },
            { targetBranches: { $size: 0 } },
            { targetBranches: "ALL" },
            { targetBranches: user.branch }
          ]
        });
      }
      
      if (user.currentYear) {
        query.$and.push({
          $or: [
            { targetYears: { $exists: false } },
            { targetYears: { $size: 0 } },
            { targetYears: user.currentYear }
          ]
        });
      }
      
      if (user.section) {
        query.$and.push({
          $or: [
            { targetSections: { $exists: false } },
            { targetSections: { $size: 0 } },
            { targetSections: user.section }
          ]
        });
      }
    }
    // ========== FACULTY FILTER ==========
    else if (req.user.role !== "admin" && req.user.role !== "management" && req.user.role !== "dean" && req.user.role !== "principal") {
      query.$and.push({
        $or: [
          { audience: "all" },
          { audience: "faculty" }
        ]
      });
    }
    
    if (query.$and.length === 0) {
      delete query.$and;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const announcements = await Announcement.find(query)
      .populate("createdBy", "name email role profilePicture")
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Announcement.countDocuments(query);
    
    res.status(200).json({
      success: true,
      announcements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET MY ANNOUNCEMENTS ====================
exports.getMyAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ createdBy: req.user.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error("Get my announcements error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ANNOUNCEMENT BY ID ====================
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("createdBy", "name email role profilePicture")
      .lean();
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== UPDATE ANNOUNCEMENT ====================
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).lean();
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      // Management can edit any
      // HOD can edit within department
      const creator = await User.findById(announcement.createdBy);
      const isManagement = req.user.role === "management";
      const isHodInSameDept = (req.user.role === "hod" || req.user.role === "dean") && creator && creator.department === req.user.department;

      if (!isManagement && !isHodInSameDept) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this announcement"
        });
      }
    }
    
    const {
      title,
      description,
      type,
      priority,
      audience,
      contacts,
      location,
      expiryDate,
      tags,
      status
    } = req.body;
    
    let parsedContacts = contacts;
    if (typeof contacts === "string") {
      parsedContacts = JSON.parse(contacts);
    }
    
    const updateData = {
      title,
      description,
      type,
      priority,
      audience,
      contacts: parsedContacts,
      location,
      expiryDate,
      tags,
      status
    };
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email role");

    // Sync Calendar Update
    if (updatedAnnouncement.calendarEventCreated) {
      let inheritedAudience = {
        audienceType: updatedAnnouncement.audience,
        targetBranches: updatedAnnouncement.targetBranches || [],
        targetYears: updatedAnnouncement.targetYears || [],
        targetSections: updatedAnnouncement.targetSections || [],
        targetSpecificStudents: updatedAnnouncement.targetSpecificStudents || []
      };

      if (updatedAnnouncement.targetMyClass) inheritedAudience.audienceType = "class";
      else if (updatedAnnouncement.targetMyProctor) inheritedAudience.audienceType = "proctor";
      else if (updatedAnnouncement.targetMySection) inheritedAudience.audienceType = "section";
      else if (updatedAnnouncement.targetMyDepartment) inheritedAudience.audienceType = "department";

      await AcademicActivity.findOneAndUpdate(
        { sourceAnnouncementId: updatedAnnouncement._id },
        { 
          title: updatedAnnouncement.title, 
          description: updatedAnnouncement.description,
          startDate: updatedAnnouncement.eventDate || updatedAnnouncement.startDate,
          endDate: updatedAnnouncement.expiryDate || null,
          venue: updatedAnnouncement.eventVenue || updatedAnnouncement.location || null,
          inheritedAudience
        }
      );
    }
    
    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE ANNOUNCEMENT ====================
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      // Management can delete any
      // HOD can delete within department
      const creator = await User.findById(announcement.createdBy);
      const isManagement = req.user.role === "management";
      const isHodInSameDept = (req.user.role === "hod" || req.user.role === "dean") && creator && creator.department === req.user.department;

      if (!isManagement && !isHodInSameDept) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this announcement"
        });
      }
    }
    
    if (announcement.calendarEventCreated) {
      await AcademicActivity.deleteOne({ sourceAnnouncementId: announcement._id });
    }
    
    // Delete associated notifications
    const Notification = require("../models/Notification");
    await Notification.deleteMany({ relatedId: announcement._id, type: "announcement" });
    
    await announcement.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully"
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ANNOUNCEMENT TYPES ====================
exports.getAnnouncementTypes = async (req, res) => {
  try {
    const types = [
      { value: "exam", label: "Exam", color: "bg-red-100 text-red-700" },
      { value: "workshop", label: "Workshop", color: "bg-blue-100 text-blue-700" },
      { value: "internship", label: "Internship", color: "bg-purple-100 text-purple-700" },
      { value: "hackathon", label: "Hackathon", color: "bg-pink-100 text-pink-700" },
      { value: "placement", label: "Placement", color: "bg-green-100 text-green-700" },
      { value: "crt", label: "CRT", color: "bg-indigo-100 text-indigo-700" },
      { value: "sports", label: "Sports", color: "bg-orange-100 text-orange-700" },
      { value: "fee", label: "Fee", color: "bg-yellow-100 text-yellow-700" },
      { value: "lab", label: "Lab", color: "bg-cyan-100 text-cyan-700" },
      { value: "academic", label: "Academic", color: "bg-emerald-100 text-emerald-700" },
      { value: "event", label: "Event", color: "bg-rose-100 text-rose-700" },
      { value: "general", label: "General", color: "bg-gray-100 text-gray-700" },
      { value: "holiday", label: "Holiday", color: "bg-teal-100 text-teal-700" },
      { value: "result", label: "Result", color: "bg-violet-100 text-violet-700" }
    ];
    
    res.status(200).json({
      success: true,
      types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};