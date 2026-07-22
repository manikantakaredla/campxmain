const Notification = require("../models/Notification");
const User = require("../models/User");
const Setting = require("../models/Setting");
const EmailDeliveryLog = require("../models/EmailDeliveryLog");
const { getIO } = require("../config/socket");
const { sendBatchEmails } = require("../utils/sendEmail");
const emailTemplates = require("../utils/emailTemplates");
const admin = require("../config/firebase");

// In-memory set to deduplicate short-lived duplicate requests (notificationId_userId)
const processingSet = new Set();

const cleanupDeduplication = (key) => {
  setTimeout(() => processingSet.delete(key), 60000); // clear after 1 min
};

const dispatchEmailJob = async (notification, targetUsers) => {
  try {
    const settings = await Setting.findOne();
    if (!settings || !settings.enableEmailNotifications) {
      return;
    }

    if (!notification.emailEnabled) {
      return;
    }

    // Resolve users to emails
    const users = await User.find({ _id: { $in: targetUsers }, "notificationPreferences.email": { $ne: false } }).select("email _id");
    const emailsToProcess = users.map(u => u.email).filter(Boolean);

    if (emailsToProcess.length === 0) return;

    // Deduplication check
    const dedupKey = `${notification._id.toString()}`; // Simple bulk dedup key for entire batch. Wait, the user asked for notificationId + userId.
    
    const validEmails = [];
    for (const u of users) {
      if (!u.email) continue;
      const userKey = `${notification._id.toString()}_${u._id.toString()}`;
      if (!processingSet.has(userKey)) {
        processingSet.add(userKey);
        validEmails.push(u.email);
        cleanupDeduplication(userKey);
      }
    }

    if (validEmails.length === 0) return;

    // Create log entry
    const log = await EmailDeliveryLog.create({
      notificationId: notification._id,
      category: notification.category || notification.type,
      totalRecipients: validEmails.length,
      status: "processing"
    });

    // Determine template based on category
    let htmlContent = emailTemplates.getGenericNotificationTemplate(notification.title, notification.message);
    
    switch (notification.category || notification.type) {
      case "announcement":
        htmlContent = emailTemplates.getAnnouncementTemplate(notification.title, notification.message);
        break;
      case "class_assignment":
        htmlContent = emailTemplates.getClassAssignmentTemplate(notification.message, "Your Department");
        break;
      case "placement":
      case "opportunity":
        htmlContent = emailTemplates.getPlacementTemplate(notification.title, notification.message);
        break;
      case "resource": {
        const Resource = require("../models/Resource");
        const resDoc = await Resource.findById(notification.relatedId).populate("uploadedBy", "name").lean();
        if (resDoc) {
          htmlContent = emailTemplates.getResourceTemplate(
            notification.title,
            notification.message,
            resDoc.subjectName,
            resDoc.uploadedBy?.name
          );
        } else {
          htmlContent = emailTemplates.getResourceTemplate(notification.title, notification.message);
        }
        break;
      }
    }

    const result = await sendBatchEmails(validEmails, notification.title, htmlContent);

    log.delivered = result.delivered;
    log.failed = result.failed;
    log.failedEmails = result.failedEmails;
    log.status = result.failed > 0 && result.delivered === 0 ? "failed" : "completed";
    await log.save();

  } catch (err) {
    console.error("Async Email Job Error:", err);
    try {
      await EmailDeliveryLog.create({
        notificationId: notification._id,
        category: notification.category || notification.type,
        totalRecipients: targetUsers.length,
        status: "failed",
        failedEmails: ["Unknown error"]
      });
    } catch(e) {}
  }
};

const dispatchFCMJob = async (notification, targetUsers) => {
  try {
    const users = await User.find({ 
      _id: { $in: targetUsers }, 
      "notificationPreferences.push": { $ne: false } 
    }).select("fcmTokens notificationPreferences");

    const category = notification.category || notification.type || "system";
    
    // Map category to preference key
    let prefKey = 'system';
    if (category === 'announcement') prefKey = 'announcements';
    else if (category === 'opportunity' || category === 'placement') prefKey = 'placements';
    else if (category === 'activity') prefKey = 'events';
    else if (category === 'internship') prefKey = 'internships';
    else if (category === 'emergency' || category === 'system') prefKey = 'emergencyAlerts';

    const tokens = [];
    users.forEach(u => {
      if (prefKey !== 'system' && u.notificationPreferences && u.notificationPreferences[prefKey] === false) {
        return; // User disabled this specific category
      }
      if (u.fcmTokens && u.fcmTokens.length > 0) {
        tokens.push(...u.fcmTokens);
      }
    });

    if (tokens.length === 0) return;
    
    if (!admin.apps.length) {
      console.warn('Firebase Admin not initialized, skipping push notifications');
      return;
    }

    let targetUrl = '/';
    if (notification.relatedId) {
      if (category === 'announcement') targetUrl = `/announcement/${notification.relatedId}`;
      else if (category === 'resource') targetUrl = `/resource/${notification.relatedId}`;
      else if (category === 'activity') targetUrl = `/activity/${notification.relatedId}`;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.message
      },
      data: {
        url: targetUrl,
        category: category
      }
    };

    const chunkSize = 500;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      const multicastMessage = { ...message, tokens: chunk };
      
      const response = await admin.messaging().sendEachForMulticast(multicastMessage);
      
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            if (resp.error.code === 'messaging/invalid-registration-token' ||
                resp.error.code === 'messaging/registration-token-not-registered') {
              failedTokens.push(chunk[idx]);
            }
          }
        });
        
        if (failedTokens.length > 0) {
          await User.updateMany(
            { fcmTokens: { $in: failedTokens } },
            { $pullAll: { fcmTokens: failedTokens } }
          );
        }
      }
    }
  } catch (error) {
    console.error("Async FCM Job Error:", error);
  }
};

exports.createNotification = async (data) => {
  // 1. Create in DB
  const notification = await Notification.create({
    title: data.title,
    message: data.message,
    type: data.type || "system",
    category: data.category || data.type || "system",
    relatedId: data.relatedId,
    targetUsers: data.targetUsers,
    createdBy: data.createdBy,
    emailEnabled: data.emailEnabled !== undefined ? data.emailEnabled : true
  });

  // 2. Broadcast Socket.IO
  const io = getIO();
  if (io && data.targetUsers) {
    data.targetUsers.forEach(userId => {
      io.to(userId.toString()).emit("new-notification", {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category
      });
    });
  }

  // 3. Queue Email and Push async (fire and forget)
  if (data.targetUsers && data.targetUsers.length > 0) {
    setTimeout(() => {
      dispatchEmailJob(notification, data.targetUsers);
      dispatchFCMJob(notification, data.targetUsers);
    }, 0);
  }

  return notification;
};

exports.createBulkNotifications = async (notificationsDataArray) => {
  // Assuming all elements have same targetUsers or different ones
  // We can insert many
  
  const formattedData = notificationsDataArray.map(data => ({
    title: data.title,
    message: data.message,
    type: data.type || "system",
    category: data.category || data.type || "system",
    relatedId: data.relatedId,
    targetUsers: data.targetUsers,
    createdBy: data.createdBy,
    emailEnabled: data.emailEnabled !== undefined ? data.emailEnabled : true
  }));

  const inserted = await Notification.insertMany(formattedData);

  const io = getIO();
  if (io) {
    inserted.forEach(notification => {
      if (notification.targetUsers) {
        notification.targetUsers.forEach(userId => {
          io.to(userId.toString()).emit("new-notification", {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            category: notification.category
          });
        });
      }
    });
  }

  // Fire and forget emails and push
  setTimeout(() => {
    inserted.forEach(notification => {
      if (notification.targetUsers && notification.targetUsers.length > 0) {
        dispatchEmailJob(notification, notification.targetUsers);
        dispatchFCMJob(notification, notification.targetUsers);
      }
    });
  }, 0);

  return inserted;
};
