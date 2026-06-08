const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements,
  getAnnouncementTypes
} = require("../controllers/announcementController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public for all authenticated users
router.get("/", protect, getAnnouncements);
router.get("/my", protect, getMyAnnouncements);
router.get("/types", protect, getAnnouncementTypes);
router.get("/:id", protect, getAnnouncementById);

// Faculty and above can create/update/delete
router.post("/", protect, authorizeRoles("faculty", "hod", "deputyhod", "dean", "principal", "admin"), upload.single("attachment"), createAnnouncement);
router.put("/:id", protect, authorizeRoles("faculty", "hod", "deputyhod", "dean", "principal", "admin"), updateAnnouncement);
router.delete("/:id", protect, authorizeRoles("faculty", "hod", "deputyhod", "dean", "principal", "admin"), deleteAnnouncement);

module.exports = router;