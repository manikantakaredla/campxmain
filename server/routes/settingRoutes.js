const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings
} = require("../controllers/settingController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/", protect, authorizeRoles("admin"), getSettings);
router.put("/", protect, authorizeRoles("admin"), updateSettings);

module.exports = router;