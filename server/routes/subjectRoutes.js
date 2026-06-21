const express = require("express");
const router = express.Router();
const {
  createSubject,
  getSubjects,
  updateSubject,
  bulkAssignSubject
} = require("../controllers/subjectController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getSubjects);

// Admin / Management only
router.use(authorizeRoles("admin", "management"));

router.post("/", createSubject);
router.put("/:id", updateSubject);
router.post("/bulk-assign", bulkAssignSubject);

module.exports = router;
