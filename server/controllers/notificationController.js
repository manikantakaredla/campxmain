const Notification = require("../models/Notification");
const User = require("../models/User");

// ==================== GET MY NOTIFICATIONS ====================
exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let query = { targetUsers: req.user.id };
    
    if (unreadOnly === "true") {
      query.isRead = false;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET UNREAD COUNT ====================
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      targetUsers: req.user.id,
      isRead: false
    });
    
    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== MARK AS READ ====================
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    // Check if user is the target
    if (!notification.targetUsers.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to mark this notification as read"
      });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== MARK ALL AS READ ====================
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { targetUsers: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE NOTIFICATION ====================
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    if (!notification.targetUsers.includes(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notification"
      });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Notification deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== FCM TOKEN MANAGEMENT ====================
exports.registerFCMToken = async (req, res) => {
  try {
    const { token, oldToken } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Handle token replacement or addition
    if (oldToken) {
      user.fcmTokens = user.fcmTokens.filter(t => t !== oldToken);
    }
    
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      
      // Limit to 5 devices max per user to prevent bloat
      if (user.fcmTokens.length > 5) {
        // Keep the 5 most recent tokens (remove from the beginning)
        user.fcmTokens = user.fcmTokens.slice(-5);
      }
      
      await user.save();
    }

    res.status(200).json({ success: true, message: "FCM token registered" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    const user = await User.findById(req.user.id);
    if (user) {
      user.fcmTokens = user.fcmTokens.filter(t => t !== token);
      await user.save();
    }

    res.status(200).json({ success: true, message: "FCM token removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.testPush = async (req, res) => {
  try {
    const { title, message, token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    const admin = require("../config/firebase");
    if (!admin.apps.length) {
      return res.status(500).json({ success: false, message: "Firebase Admin not initialized" });
    }

    const payload = {
      notification: {
        title: title || 'Test Notification',
        body: message || 'This is a test notification.'
      },
      data: {
        url: '/dev/notifications',
        category: 'system'
      },
      token: token
    };

    const response = await admin.messaging().send(payload);
    res.status(200).json({ success: true, message: "Test push sent", response });
  } catch (error) {
    console.error("Test Push Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE PREFERENCES ====================
exports.updatePreferences = async (req, res) => {
  try {
    const { email, push, announcements, placements, events, internships, emergencyAlerts } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (email !== undefined) user.notificationPreferences.email = email;
    if (push !== undefined) user.notificationPreferences.push = push;
    if (announcements !== undefined) user.notificationPreferences.announcements = announcements;
    if (placements !== undefined) user.notificationPreferences.placements = placements;
    if (events !== undefined) user.notificationPreferences.events = events;
    if (internships !== undefined) user.notificationPreferences.internships = internships;
    if (emergencyAlerts !== undefined) user.notificationPreferences.emergencyAlerts = emergencyAlerts;

    await user.save();

    res.status(200).json({ success: true, message: "Preferences updated successfully", preferences: user.notificationPreferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};