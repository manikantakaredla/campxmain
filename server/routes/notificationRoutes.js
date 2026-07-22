const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerFCMToken,
  removeFCMToken,
  updatePreferences
} = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getMyNotifications);
router.get("/unread/count", getUnreadCount);
router.put("/preferences", updatePreferences);
router.post("/fcm-token", registerFCMToken);
router.delete("/fcm-token", removeFCMToken);
router.put("/read-all", markAllAsRead);
router.put("/:id", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;