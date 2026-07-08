const crypto = require('crypto');
const Resource = require("../models/Resource");
const Subject = require("../models/Subject");
const notificationService = require("../services/notificationService");
const User = require("../models/User");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
const { getIO } = require("../config/socket");
const supabase = require("../config/supabase");

// ==================== CREATE RESOURCE ====================
exports.createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      resourceType,
      subjectId,
      unitNumber,
      approvalStatus,
      targetSection,
      status
    } = req.body;
    
    // Convert let variable so we can reassign it
    let { targetBranch, visibility } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required"
      });
    }

    const isNotesCategory = (resourceType === 'Notes' || category === 'Notes');
    
    if (isNotesCategory && !subjectId) {
      return res.status(400).json({
        success: false,
        message: "Subject is required for Notes"
      });
    }

    if (!resourceType) {
      return res.status(400).json({
        success: false,
        message: "Resource Type is required"
      });
    }

    let subject = null;
    if (subjectId) {
      subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: "Selected subject not found"
        });
      }
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Faculty verification: check if subject is assigned to them
    if (["faculty", "hod"].includes(currentUser.role)) {
      if (subjectId) {
        const primaryIds = currentUser.facultySubjects?.primary?.map(id => id.toString()) || [];
        const secondaryIds = currentUser.facultySubjects?.secondary?.map(id => id.toString()) || [];
        
        const isAssigned = primaryIds.includes(subjectId.toString()) || secondaryIds.includes(subjectId.toString());
        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            message: "You can only upload resources for subjects assigned to you."
          });
        }
      } else {
        // If no subject is selected, enforce department boundary
        targetBranch = currentUser.department;
        visibility = "branch"; 
      }
    }

    // Upload file to Supabase
    const fileName = `resources/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${req.file.originalname}`;
    const { error } = await supabase.storage
      .from("campx-files")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload file: " + error.message
      });
    }

    const { data: publicUrl } = supabase.storage
      .from("campx-files")
      .getPublicUrl(fileName);

    // Target audience is derived directly from the subject or from the body/currentUser
    const finalTargetBranch = subject ? subject.department : (targetBranch || currentUser?.department);
    const finalTargetYear = subject ? Math.ceil(subject.semester / 2) : (targetYear || undefined);

    const resourceStatus = status || "active";
    const resource = await Resource.create({
      title,
      description,
      category: resourceType || category || "Notes",
      resourceType: resourceType || "Notes",
      subjectId: subjectId || undefined,
      subjectName: subject ? subject.name : undefined,
      department: subject ? subject.department : finalTargetBranch,
      semester: subject ? subject.semester : undefined,
      unitNumber: unitNumber ? parseInt(unitNumber) : undefined,
      approvalStatus: approvalStatus || "approved",
      fileUrl: publicUrl.publicUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      visibility: visibility || "branch",
      targetBranch: finalTargetBranch,
      targetYear: finalTargetYear,
      targetSection: targetSection || undefined,
      status: resourceStatus,
      notificationsSent: resourceStatus === "active",
      uploadedBy: req.user.id
    });

    await resource.populate("uploadedBy", "name email");

    if (resource.status === "active" && resource.approvalStatus === "approved") {
      // Create notifications for target users
      await createNotificationsForResource(resource);

      // Emit realtime event
      const io = getIO();
      io.emit("new-resource", resource);
    }

    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully",
      resource
    });
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to create notifications
async function createNotificationsForResource(resource) {
  try {
    let targetUsers = [];

    if (resource.visibility === "all") {
      targetUsers = await User.find({ role: "student", isActive: true }).select("_id");
    } else if (resource.visibility === "branch" && resource.targetBranch) {
      targetUsers = await User.find({ 
        role: "student", 
        branch: resource.targetBranch,
        isActive: true 
      }).select("_id");
    } else if (resource.visibility === "year" && resource.targetYear) {
      targetUsers = await User.find({ 
        role: "student", 
        branch: resource.targetBranch,
        currentYear: resource.targetYear,
        isActive: true 
      }).select("_id");
    } else if (resource.visibility === "section" && resource.targetSection) {
      targetUsers = await User.find({ 
        role: "student", 
        branch: resource.targetBranch,
        currentYear: resource.targetYear,
        section: resource.targetSection,
        isActive: true 
      }).select("_id");
    } else if (resource.visibility === "class") {
      const assignments = await ClassStudentAssignment.find({ facultyId: resource.uploadedBy._id }).select("studentId");
      targetUsers = assignments.map(a => ({ _id: a.studentId }));
    } else if (resource.visibility === "proctor") {
      const assignments = await ProctorStudentAssignment.find({ facultyId: resource.uploadedBy._id }).select("studentId");
      targetUsers = assignments.map(a => ({ _id: a.studentId }));
    }

    if (targetUsers.length > 0) {
      const notifications = targetUsers.map(user => ({
        title: `New Resource: ${resource.title}`,
        message: `New ${resource.category} available: ${resource.title}`,
        type: "resource",
        relatedId: resource._id,
        targetUsers: [user._id],
        createdBy: resource.uploadedBy._id
      }));

      await notificationService.createBulkNotifications(notifications);
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
}

// ==================== GET ALL RESOURCES ====================
exports.getResources = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      resourceType,
      subjectId,
      semester,
      uploadedBy,
      department,
      approvalStatus,
      search, 
      branch, 
      year, 
      forClass 
    } = req.query;
    
    let query = {};
    if (req.user && req.user.role === "student") {
      query.status = "active";
      query.approvalStatus = "approved";
    } else {
      query.status = { $in: ["active", "draft"] };
      if (approvalStatus) {
        query.approvalStatus = approvalStatus;
      }
    }
    
    if (category && category !== "all") {
      query.$or = [
        { resourceType: category },
        { category: category }
      ];
    }
    if (resourceType && resourceType !== "all") {
      query.resourceType = resourceType;
    }
    if (subjectId) {
      query.subjectId = subjectId;
    }
    if (semester) {
      query.semester = parseInt(semester);
    }
    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }
    if (department) {
      query.department = department;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { subjectName: { $regex: search, $options: "i" } }
      ];
    }
    
    // Filter by user's branch and year for students
    if (req.user.role === "student") {
      const [user, classAssignment, proctorAssignment] = await Promise.all([
        User.findById(req.user.id),
        ClassStudentAssignment.findOne({ studentId: req.user.id }).select("facultyId"),
        ProctorStudentAssignment.findOne({ studentId: req.user.id }).select("facultyId")
      ]);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Find subjects for student's branch
      const subjectQuery = {};
      if (user.branch) {
        subjectQuery.department = user.branch;
      }
      
      const studentSubjects = await Subject.find(subjectQuery).select("_id");
      const subjectIds = studentSubjects.map(s => s._id);

      const accessibilityQuery = [
        { subjectId: { $in: subjectIds } },
        { subjectId: { $exists: false } },
        { subjectId: null }
      ];

      if (forClass === "true") {
        const facultyIds = [];
        if (classAssignment?.facultyId) facultyIds.push(classAssignment.facultyId);
        if (proctorAssignment?.facultyId) facultyIds.push(proctorAssignment.facultyId);
        
        query.$and = [
          { $or: accessibilityQuery },
          { uploadedBy: { $in: facultyIds } }
        ];
      } else {
        query.$and = [
          { $or: accessibilityQuery },
          {
            $or: [
              { visibility: "all" },
              { visibility: "branch", targetBranch: user.branch },
              { visibility: "year", targetBranch: user.branch, targetYear: user.currentYear },
              { visibility: "section", targetBranch: user.branch, targetYear: user.currentYear, targetSection: user.section }
            ]
          }
        ];

        if (classAssignment) {
          query.$and[1].$or.push({ visibility: "class", uploadedBy: classAssignment.facultyId });
        }
        if (proctorAssignment) {
          query.$and[1].$or.push({ visibility: "proctor", uploadedBy: proctorAssignment.facultyId });
        }
      }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resources = await Resource.find(query)
      .populate("uploadedBy", "name email department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Resource.countDocuments(query);
    
    res.status(200).json({
      success: true,
      resources,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET RESOURCE BY ID ====================
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate("uploadedBy", "name email department")
      .lean();
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }
    
    res.status(200).json({
      success: true,
      resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== UPDATE RESOURCE ====================
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }
    
    // Check ownership
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this resource"
      });
    }
    
    const { 
      title, 
      description, 
      category, 
      resourceType,
      subjectId,
      unitNumber,
      approvalStatus,
      visibility, 
      targetBranch, 
      targetYear, 
      targetSection, 
      status 
    } = req.body;

    let updateFields = { 
      title, 
      description, 
      category: resourceType || category, 
      resourceType,
      unitNumber: unitNumber ? parseInt(unitNumber) : undefined,
      approvalStatus,
      visibility, 
      targetBranch, 
      targetYear, 
      targetSection, 
      status 
    };

    if (subjectId && subjectId !== (resource.subjectId ? resource.subjectId.toString() : '')) {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: "Selected subject not found"
        });
      }

      // Check faculty permission
      const currentUser = await User.findById(req.user.id);
      if (["faculty", "hod"].includes(currentUser.role)) {
        const primaryIds = currentUser.facultySubjects?.primary?.map(id => id.toString()) || [];
        const secondaryIds = currentUser.facultySubjects?.secondary?.map(id => id.toString()) || [];
        
        const isAssigned = primaryIds.includes(subjectId.toString()) || secondaryIds.includes(subjectId.toString());
        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            message: "You can only assign subjects that are officially allocated to you."
          });
        }
      }

      updateFields.subjectId = subjectId;
      updateFields.subjectName = subject.name;
      updateFields.department = subject.department;
      updateFields.semester = subject.semester;
      updateFields.targetBranch = subject.department;
      updateFields.targetYear = Math.ceil(subject.semester / 2);
    }
    
    let sendNotifications = false;
    if (status === "active" && resource.status !== "active" && !resource.notificationsSent) {
      sendNotifications = true;
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate("uploadedBy", "name email");
    
    if (sendNotifications && updatedResource.approvalStatus === "approved") {
      updatedResource.notificationsSent = true;
      await updatedResource.save();
      await createNotificationsForResource(updatedResource);
      const io = getIO();
      io.emit("new-resource", updatedResource);
    }
    
    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      resource: updatedResource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE RESOURCE ====================
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }
    
    // Check ownership
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this resource"
      });
    }
    
    await resource.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Resource deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DOWNLOAD RESOURCE ====================
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }
    
    res.status(200).json({
      success: true,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      downloads: resource.downloads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET FACULTY ASSIGNED SUBJECTS ====================
exports.getFacultySubjects = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("facultySubjects.primary")
      .populate("facultySubjects.secondary")
      .lean();
      
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const primary = user.facultySubjects?.primary || [];
    const secondary = user.facultySubjects?.secondary || [];

    const getCount = async (sub) => {
       const count = await Resource.countDocuments({ subjectId: sub._id, status: { $in: ["active", "draft"] }});
       return { ...sub, resourceCount: count };
    };

    const [primaryWithCounts, secondaryWithCounts] = await Promise.all([
      Promise.all(primary.map(getCount)),
      Promise.all(secondary.map(getCount))
    ]);

    res.status(200).json({
      success: true,
      primary: primaryWithCounts,
      secondary: secondaryWithCounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ADMIN RESOURCE ANALYTICS ====================
exports.getResourceAnalytics = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    
    // Resources by Department
    const byDept = await Resource.aggregate([
      { $match: { department: { $ne: null } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Resources by Subject
    const bySubject = await Resource.aggregate([
      { $match: { subjectName: { $ne: null } } },
      { $group: { _id: "$subjectName", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top contributing faculty
    const topFaculty = await Resource.aggregate([
      { $group: { _id: "$uploadedBy", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "faculty" } },
      { $unwind: "$faculty" },
      { $project: { name: "$faculty.name", employeeId: "$faculty.employeeId", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Most downloaded resources
    const mostDownloaded = await Resource.find()
      .populate("uploadedBy", "name")
      .sort({ downloads: -1 })
      .limit(5)
      .lean();

    // Most active subjects by downloads
    const activeSubjects = await Resource.aggregate([
      { $match: { subjectName: { $ne: null } } },
      { $group: { _id: "$subjectName", totalDownloads: { $sum: "$downloads" } } },
      { $sort: { totalDownloads: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalResources,
        byDepartment: byDept.map(d => ({ department: d._id, count: d.count })),
        bySubject: bySubject.map(s => ({ subjectName: s._id, count: s.count })),
        topFaculty,
        mostDownloaded,
        mostActiveSubjects: activeSubjects.map(s => ({ subjectName: s._id, downloads: s.totalDownloads }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};