const express = require("express");
const router = express.Router();
const protect = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

const { 
  importMasterData, 
  getConfig, 
  updateConfig, 
  getImportHistory,
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion
} = require("../controllers/adminController");

const {
  getDashboardOverview,
  getHeatmap,
  getDetailedAnalytics,
  getFacultyStudentResponses
} = require("../controllers/analyticsController");

router.use(protect, authorizeRoles("admin", "principal"));

// Config
router.get("/config", getConfig);
router.put("/config", updateConfig);

// Data Import
router.post("/import", importMasterData);
router.get("/import-history", getImportHistory);

// Questions
router.get("/questions", getQuestions);
router.post("/questions", addQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

// Analytics
router.get("/analytics/overview", getDashboardOverview);
router.get("/analytics/heatmap", getHeatmap);
router.get("/analytics/detailed", getDetailedAnalytics);
router.get("/analytics/faculty-students", getFacultyStudentResponses);

module.exports = router;
