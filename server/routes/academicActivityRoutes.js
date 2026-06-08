const express = require("express");
const router = express.Router();
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getUpcomingActivities
} = require("../controllers/academicActivityController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// All authenticated users can view
router.get("/", protect, getActivities);
router.get("/upcoming", protect, getUpcomingActivities);
router.get("/:id", protect, getActivityById);

// Faculty and above can create/update/delete
router.post("/", protect, authorizeRoles("faculty", "hod", "deputyhod", "dean", "principal", "admin"), createActivity);
router.put("/:id", protect, authorizeRoles("faculty", "hod", "deputyhod", "dean", "principal", "admin"), updateActivity);
router.delete("/:id", protect, authorizeRoles("faculty", "hod", "deputyhod", "dean", "principal", "admin"), deleteActivity);

module.exports = router;