const express = require("express");
const router = express.Router();
const {
  getClassStudents,
  getProctorStudents,
  getAllAssignedStudents, getAllDepartmentStudents,
  searchStudents,
  getStudentDetail,
  getClassAssignmentsSummary,
  getWorkloadSummary
} = require("../controllers/facultyController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(protect, authorizeRoles("faculty", "hod", "dean", "principal"));

router.get("/me/workload", getWorkloadSummary);
router.get("/class-assignments-summary", getClassAssignmentsSummary);
router.get("/students/class", getClassStudents);
router.get("/students/proctor", getProctorStudents);
router.get("/students/all", getAllAssignedStudents);
router.get("/students/department", getAllDepartmentStudents);
router.get("/students/search", searchStudents);
router.get("/students/:studentId", getStudentDetail);

module.exports = router;