const express = require("express");
const router = express.Router();
const {
  getDepartmentFaculty,
  getDepartmentStudents,
  assignClassStudents,
  assignProctorStudents,
  getClassAssignments,
  getProctorAssignments,
  removeClassAssignment,
  removeProctorAssignment,
  getSectionAssignments,
  getAssignmentPreview,
  assignSection,
  bulkReassignSection,
  deleteSectionAssignment
} = require("../controllers/hodController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// HOD, Deputy HOD, Dean, Principal, Admin can access
router.use(protect, authorizeRoles("hod", "deputyhod", "dean", "principal", "admin"));

router.get("/faculty", getDepartmentFaculty);
router.get("/students", getDepartmentStudents);

router.post("/assign/class", assignClassStudents);
router.post("/assign/proctor", assignProctorStudents);

router.get("/assignments/class", getClassAssignments);
router.get("/assignments/proctor", getProctorAssignments);

// Section-level assignments
router.get("/assignments/sections", getSectionAssignments);
router.post("/assignments/preview", getAssignmentPreview);
router.post("/assignments/sections", assignSection);
router.post("/assignments/sections/bulk-reassign", bulkReassignSection);
router.delete("/assignments/sections/:id", deleteSectionAssignment);

router.delete("/assign/class/:studentId", removeClassAssignment);
router.delete("/assign/proctor/:studentId", removeProctorAssignment);

module.exports = router;