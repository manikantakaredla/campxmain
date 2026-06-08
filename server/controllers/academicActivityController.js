const AcademicActivity = require("../models/AcademicActivity");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { getIO } = require("../config/socket");

// ==================== CREATE ACTIVITY ====================
exports.createActivity = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      venue,
      targetAudience
    } = req.body;

    const activity = await AcademicActivity.create({
      title,
      description,
      type,
      startDate,
      endDate,
      venue,
      targetAudience: targetAudience || {},
      createdBy: req.user.id
    });

    await activity.populate("createdBy", "name email");

    // Create notifications for relevant users
    await createNotificationsForActivity(activity);

    // Emit realtime event
    const io = getIO();
    io.emit("new-activity", activity);

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      activity
    });
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to create notifications
async function createNotificationsForActivity(activity) {
  try {
    let targetUsers = [];
    
    if (activity.targetAudience?.branch && activity.targetAudience?.year) {
      targetUsers = await User.find({
        role: "student",
        branch: activity.targetAudience.branch,
        currentYear: activity.targetAudience.year,
        isActive: true
      }).select("_id");
    } else if (activity.targetAudience?.branch) {
      targetUsers = await User.find({
        role: "student",
        branch: activity.targetAudience.branch,
        isActive: true
      }).select("_id");
    } else {
      targetUsers = await User.find({ role: "student", isActive: true }).select("_id");
    }
    
    if (targetUsers.length > 0 && targetUsers.length < 1000) {
      const notifications = targetUsers.map(user => ({
        title: `New ${activity.type}: ${activity.title}`,
        message: activity.description || `${activity.type} scheduled on ${new Date(activity.startDate).toLocaleDateString()}`,
        type: "activity",
        relatedId: activity._id,
        targetUsers: [user._id],
        createdBy: activity.createdBy._id
      }));
      
      await Notification.insertMany(notifications);
      
      const io = getIO();
      targetUsers.forEach(user => {
        io.to(user._id.toString()).emit("new-notification", {
          title: `New ${activity.type}`,
          message: activity.title
        });
      });
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
}

// ==================== GET ACTIVITIES ====================
exports.getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;
    
    let query = {};
    
    if (type && type !== "all") {
      query.type = type;
    }
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const activities = await AcademicActivity.find(query)
      .populate("createdBy", "name email")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await AcademicActivity.countDocuments(query);
    
    res.status(200).json({
      success: true,
      activities,
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

// ==================== GET UPCOMING ACTIVITIES ====================
exports.getUpcomingActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const activities = await AcademicActivity.find({
      status: { $in: ["upcoming", "ongoing"] },
      startDate: { $gte: new Date() }
    })
      .populate("createdBy", "name")
      .sort({ startDate: 1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ACTIVITY BY ID ====================
exports.getActivityById = async (req, res) => {
  try {
    const activity = await AcademicActivity.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }
    
    res.status(200).json({
      success: true,
      activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== UPDATE ACTIVITY ====================
exports.updateActivity = async (req, res) => {
  try {
    const activity = await AcademicActivity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }
    
    if (activity.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this activity"
      });
    }
    
    const updatedActivity = await AcademicActivity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");
    
    res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      activity: updatedActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE ACTIVITY ====================
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await AcademicActivity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }
    
    if (activity.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this activity"
      });
    }
    
    await activity.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Activity deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};