const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePhoneNumber,
  updateProfilePicture,
  changePassword,
  updateNotificationPreferences,
  getDashboardData,
  getAssignedFaculty
} = require("../controllers/studentController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect, authorizeRoles("student"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/profile/phone", updatePhoneNumber);
router.put("/profile/picture", upload.single("file"), updateProfilePicture);
router.put("/change-password", changePassword);
router.put("/notification-preferences", updateNotificationPreferences);
router.get("/dashboard", getDashboardData);

router.get("/assigned-faculty", protect, authorizeRoles("student"), getAssignedFaculty);

module.exports = router;