const Notification = require("../models/Notification");
const User = require("../models/User");
const Setting = require("../models/Setting");
const EmailDeliveryLog = require("../models/EmailDeliveryLog");
const { getIO } = require("../config/socket");
const { sendBatchEmails } = require("../utils/sendEmail");
const emailTemplates = require("../utils/emailTemplates");

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
      case "resource":
        htmlContent = emailTemplates.getResourceTemplate(notification.title, notification.message);
        break;
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

  // 3. Queue Email async (fire and forget)
  if (data.targetUsers && data.targetUsers.length > 0) {
    setTimeout(() => {
      dispatchEmailJob(notification, data.targetUsers);
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

  // Fire and forget emails
  setTimeout(() => {
    inserted.forEach(notification => {
      if (notification.targetUsers && notification.targetUsers.length > 0) {
        dispatchEmailJob(notification, notification.targetUsers);
      }
    });
  }, 0);

  return inserted;
};
