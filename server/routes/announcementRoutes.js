const express = require("express");
const router = express.Router();

const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements,
  getAnnouncementTypes,
  getClassTeacherAnnouncements,
  getProctorAnnouncements,
  searchStudents,
  previewRecipients
} = require("../controllers/announcementController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// =====================================================
// ANNOUNCEMENT ROUTES
// =====================================================

// Get all announcements visible to logged-in user
router.get("/", protect, getAnnouncements);

// Get announcements created by logged-in user
router.get("/my", protect, getMyAnnouncements);

// Get announcement categories/types
router.get("/types", protect, getAnnouncementTypes);

// Class Teacher announcements
router.get("/class-teacher", protect, getClassTeacherAnnouncements);

// Proctor announcements
router.get("/proctor", protect, getProctorAnnouncements);

// Search students
router.get("/search-students", protect, searchStudents);

// Preview recipients
router.post("/preview-recipients", protect, previewRecipients);

// Get announcement by ID
// IMPORTANT: Keep this AFTER all specific routes
router.get("/:id", protect, getAnnouncementById);

// =====================================================
// CREATE ANNOUNCEMENT
// =====================================================
router.post(
  "/",
  protect,
  authorizeRoles(
    "faculty",
    "hod",
    "deputyhod",
    "dean",
    "principal",
    "admin"
  ),
  upload.single("attachment"),
  createAnnouncement
);

// =====================================================
// UPDATE ANNOUNCEMENT
// =====================================================
router.put(
  "/:id",
  protect,
  authorizeRoles(
    "faculty",
    "hod",
    "deputyhod",
    "dean",
    "principal",
    "admin"
  ),
  upload.single("attachment"),
  updateAnnouncement
);

// =====================================================
// DELETE ANNOUNCEMENT
// =====================================================
router.delete(
  "/:id",
  protect,
  authorizeRoles(
    "faculty",
    "hod",
    "deputyhod",
    "dean",
    "principal",
    "admin"
  ),
  deleteAnnouncement
);

module.exports = router;