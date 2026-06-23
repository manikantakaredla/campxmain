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
  getResourceAnalytics
} = require("../controllers/resourceController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All authenticated users can view
router.get("/", protect, getResources);
router.get("/analytics", protect, authorizeRoles("admin", "management", "principal", "dean"), getResourceAnalytics);
router.get("/faculty-subjects", protect, authorizeRoles("faculty", "hod"), getFacultySubjects);
router.get("/:id", protect, getResourceById);
router.put("/download/:id", protect, downloadResource);

// Faculty and above can create/update/delete
router.post("/", protect, authorizeRoles("faculty", "hod", "dean", "principal", "admin"), upload.single("file"), createResource);
router.put("/:id", protect, authorizeRoles("faculty", "hod", "dean", "principal", "admin"), updateResource);
router.delete("/:id", protect, authorizeRoles("faculty", "hod", "dean", "principal", "admin"), deleteResource);

module.exports = router;