const express = require("express");
const router = express.Router();
const {
  getClassStudents,
  getProctorStudents,
  getAllAssignedStudents, getAllDepartmentStudents,
  searchStudents,
  getStudentDetail
} = require("../controllers/facultyController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(protect, authorizeRoles("faculty", "hod", "deputyhod", "dean", "principal"));

router.get("/students/class", getClassStudents);
router.get("/students/proctor", getProctorStudents);
router.get("/students/all", getAllDepartmentStudents);
router.get("/students/search", searchStudents);
router.get("/students/:studentId", getStudentDetail);

module.exports = router;