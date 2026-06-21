const crypto = require('crypto');
const Resource = require("../models/Resource");
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
      visibility,
      targetBranch,
      targetYear,
      targetSection,
      status
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required"
      });
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

    
    const currentUser = await User.findById(req.user.id);
    let finalTargetBranch = targetBranch || null;
    
    if (["faculty", "hod", "deputyhod"].includes(currentUser.role)) {
      finalTargetBranch = currentUser.department;
    } else if (["dean", "principal", "management"].includes(currentUser.role)) {
      const allowedBranches = currentUser.managedBranches && currentUser.managedBranches.length > 0 
        ? currentUser.managedBranches 
        : [currentUser.department];
      
      if (targetBranch && !allowedBranches.includes(targetBranch)) {
        return res.status(403).json({
          success: false,
          message: "You can only target your managed branches."
        });
      }
    }

    const resourceStatus = status || "active";
    const resource = await Resource.create({
      title,
      description,
      category,
      fileUrl: publicUrl.publicUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      visibility: visibility || "all",
      targetBranch: finalTargetBranch,
      targetYear,
      targetSection,
      status: resourceStatus,
      notificationsSent: resourceStatus === "active",
      uploadedBy: req.user.id
    });

    await resource.populate("uploadedBy", "name email");

    if (resource.status === "active") {
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
    const { page = 1, limit = 10, category, search, branch, year, forClass } = req.query;
    
    let query = {};
    if (req.user && req.user.role === "student") {
      query.status = "active";
    } else {
      query.status = { $in: ["active", "draft"] };
    }
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    // Filter by user's branch and year for students
  // Find this section (around line 130-160) and replace it:

if (req.user.role === "student") {
  const user = await User.findById(req.user.id);
  const classAssignment = await ClassStudentAssignment.findOne({ studentId: req.user.id }).select("facultyId");
  const proctorAssignment = await ProctorStudentAssignment.findOne({ studentId: req.user.id }).select("facultyId");

  if (forClass === "true") {
    // MODIFIED: Only show resources from class teacher and proctor
    const facultyIds = [];
    if (classAssignment?.facultyId) facultyIds.push(classAssignment.facultyId);
    if (proctorAssignment?.facultyId) facultyIds.push(proctorAssignment.facultyId);
    
    query.$or = [
      { uploadedBy: { $in: facultyIds } }  // Only class teacher & proctor
      // Remove section filter:
      // { visibility: "section", targetSection: user.section }
    ];
  } else {
    // Keep existing logic for regular resources
    query.$or = [
      { visibility: "all" },
      { visibility: "branch", targetBranch: user.branch },
      { visibility: "year", targetBranch: user.branch, targetYear: user.currentYear },
      { visibility: "section", targetBranch: user.branch, targetYear: user.currentYear, targetSection: user.section }
    ];

    if (classAssignment) {
      query.$or.push({ visibility: "class", uploadedBy: classAssignment.facultyId });
    }
    if (proctorAssignment) {
      query.$or.push({ visibility: "proctor", uploadedBy: proctorAssignment.facultyId });
    }
  }
}
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resources = await Resource.find(query)
      .populate("uploadedBy", "name email")
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
    
    const { title, description, category, visibility, targetBranch, targetYear, targetSection, status } = req.body;
    
    let sendNotifications = false;
    if (status === "active" && resource.status !== "active" && !resource.notificationsSent) {
      sendNotifications = true;
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { title, description, category, visibility, targetBranch, targetYear, targetSection, status },
      { new: true, runValidators: true }
    ).populate("uploadedBy", "name email");
    
    if (sendNotifications) {
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