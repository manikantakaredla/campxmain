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

// ==================== ALL ROUTES REQUIRE AUTH ====================
router.use(protect);

// ==================== ADMIN ONLY ROUTES ====================
router.get("/dashboard/stats", authorizeRoles("admin"), getDashboardStats);
router.get("/users", authorizeRoles("admin"), getAllUsers);

router.post("/users", authorizeRoles("admin"), createUser);
router.post("/users/bulk", authorizeRoles("admin"), csvUpload.single("file"), bulkCreateUsers);

router.get("/users/:id", authorizeRoles("admin"), getUserById);
router.put("/users/:id", authorizeRoles("admin"), updateUser);
router.delete("/users/:id", authorizeRoles("admin"), deleteUser);
router.put("/users/:id/reset-password", authorizeRoles("admin"), resetUserPassword);
router.put("/users/:id/role", authorizeRoles("admin"), updateUserRole);

// Student and Faculty data upload (Admin only) - USE csvUpload
router.post("/upload/students", authorizeRoles("admin"), csvUpload.single("file"), uploadStudents);
router.post("/upload/faculty", authorizeRoles("admin"), csvUpload.single("file"), uploadFaculty);

// Class and Proctor assignments (Admin + Management) - USE csvUpload
router.post("/upload/class-assignments", 
  authorizeRoles("admin", "hod", "deputyhod", "dean", "principal"), 
  csvUpload.single("file"),
  uploadClassAssignments
);

router.post("/upload/proctor-assignments", 
  authorizeRoles("admin", "hod", "deputyhod", "dean", "principal"), 
  csvUpload.single("file"),
  uploadProctorAssignments
);

module.exports = router;