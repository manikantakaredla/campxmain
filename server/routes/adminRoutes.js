const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  bulkCreateUsers,
  resetUserPassword,
  updateUserRole
} = require("../controllers/adminController");
const {
  uploadStudents,
  uploadFaculty,
  uploadClassAssignments,
  uploadProctorAssignments,
 
} = require("../controllers/uploadDataController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const csvUpload = require("../middleware/csvUploadMiddleware"); // ADD THIS

const {
  getFacultyList,
  getFacultyDetails,
  updateFacultySubjects,
  getFacultyAnalytics
} = require("../controllers/adminFacultyController");

const {
  getSectionSubjects,
  assignSubjectFaculty,
  getFacultyBySubject,
  getSubjectsByDepartmentAndYear
} = require("../controllers/subjectAssignmentController");

// ==================== ALL ROUTES REQUIRE AUTH ====================
router.use(protect);

// ==================== ADMIN ONLY ROUTES ====================
router.get("/dashboard/stats", authorizeRoles("admin", "hod", "dean", "principal"), getDashboardStats);
router.get("/users", authorizeRoles("admin", "hod", "dean", "principal"), getAllUsers);

router.post("/users", authorizeRoles("admin"), createUser);
router.post("/users/bulk", authorizeRoles("admin"), csvUpload.single("file"), bulkCreateUsers);

router.get("/users/:id", authorizeRoles("admin", "hod", "dean", "principal"), getUserById);
router.put("/users/:id", authorizeRoles("admin"), updateUser);
router.delete("/users/:id", authorizeRoles("admin"), deleteUser);
router.put("/users/:id/reset-password", authorizeRoles("admin"), resetUserPassword);
router.put("/users/:id/role", authorizeRoles("admin"), updateUserRole);

// ==================== FACULTY MANAGEMENT (Admin) ====================
router.get("/faculty/analytics", authorizeRoles("admin", "hod", "dean", "principal"), getFacultyAnalytics);
router.get("/faculty", authorizeRoles("admin", "hod", "dean", "principal"), getFacultyList);
router.get("/faculty/:id", authorizeRoles("admin", "hod", "dean", "principal"), getFacultyDetails);
router.put("/faculty/:id/subjects", authorizeRoles("admin", "hod", "dean", "principal"), updateFacultySubjects);

// ==================== SUBJECT ASSIGNMENT (Admin) ====================
router.get("/sections/:department/:year/:section/subjects", authorizeRoles("admin", "hod", "dean", "principal"), getSectionSubjects);
router.post("/sections/assign-subject", authorizeRoles("admin", "hod", "dean", "principal"), assignSubjectFaculty);
router.get("/subjects/:subjectId/faculty", authorizeRoles("admin", "hod", "dean", "principal"), getFacultyBySubject);
router.get("/subjects/department/:department/year/:year", authorizeRoles("admin", "hod", "dean", "principal"), getSubjectsByDepartmentAndYear);


// Student and Faculty data upload (Admin only) - USE csvUpload
router.post("/upload/students", authorizeRoles("admin"), csvUpload.single("file"), uploadStudents);
router.post("/upload/faculty", authorizeRoles("admin"), csvUpload.single("file"), uploadFaculty);

// Class and Proctor assignments (Admin + Management) - USE csvUpload
router.post("/upload/class-assignments", 
  authorizeRoles("admin", "hod", "dean", "principal"), 
  csvUpload.single("file"),
  uploadClassAssignments
);

router.post("/upload/proctor-assignments", 
  authorizeRoles("admin", "hod", "dean", "principal"), 
  csvUpload.single("file"),
  uploadProctorAssignments
);

module.exports = router;