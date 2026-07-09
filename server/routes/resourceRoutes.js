const express = require("express");
const router = express.Router();
const {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadResource,
  getFacultySubjects,
  getResourceAnalytics,
  markCompleted,
  getCompletionStatus,
  markViewed
} = require("../controllers/resourceController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All authenticated users can view
router.get("/", protect, getResources);
router.get("/analytics", protect, authorizeRoles("admin", "hod", "principal", "dean"), getResourceAnalytics);
router.get("/faculty-subjects", protect, authorizeRoles("faculty", "hod"), getFacultySubjects);
router.get("/:id", protect, getResourceById);
router.put("/download/:id", protect, downloadResource);
router.post("/:id/complete", protect, authorizeRoles("student"), markCompleted);
router.post("/:id/view", protect, markViewed);
router.get("/:id/completion-status", protect, authorizeRoles("faculty", "hod", "dean", "principal", "admin"), getCompletionStatus);

// Faculty and above can create/update/delete
router.post("/", protect, authorizeRoles("faculty", "hod", "dean", "principal", "admin"), upload.single("file"), createResource);
router.put("/:id", protect, authorizeRoles("faculty", "hod", "dean", "principal", "admin"), updateResource);
router.delete("/:id", protect, authorizeRoles("faculty", "hod", "dean", "principal", "admin"), deleteResource);

module.exports = router;