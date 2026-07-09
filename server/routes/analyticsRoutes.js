const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAnalyticsItems, getItemAnalytics } = require("../controllers/analyticsController");

// Only faculty and above can access these routes
router.use(protect);
router.use(authorizeRoles("faculty", "hod", "dean", "principal", "admin"));

router.get("/items", getAnalyticsItems);
router.get("/item/:type/:id", getItemAnalytics);

module.exports = router;
