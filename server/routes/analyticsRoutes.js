const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAnalyticsItems, getItemAnalytics, sendReminder } = require("../controllers/analyticsController");

// Only faculty and above can access these routes
router.use(protect);
router.use(authorizeRoles("faculty", "hod", "dean", "principal", "admin"));

router.get("/items", getAnalyticsItems);
router.get("/item/:type/:id", getItemAnalytics);
router.post("/item/:type/:id/remind", sendReminder);

module.exports = router;
