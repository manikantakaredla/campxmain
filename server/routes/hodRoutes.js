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
  removeProctorAssignment
} = require("../controllers/hodController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// HOD, Deputy HOD, Dean, Principal can access
router.use(protect, authorizeRoles("hod", "deputyhod", "dean", "principal"));

router.get("/faculty", getDepartmentFaculty);
router.get("/students", getDepartmentStudents);

router.post("/assign/class", assignClassStudents);
router.post("/assign/proctor", assignProctorStudents);

router.get("/assignments/class", getClassAssignments);
router.get("/assignments/proctor", getProctorAssignments);

router.delete("/assign/class/:studentId", removeClassAssignment);
router.delete("/assign/proctor/:studentId", removeProctorAssignment);

module.exports = router;