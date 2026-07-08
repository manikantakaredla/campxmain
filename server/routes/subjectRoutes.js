const express = require("express");
const router = express.Router();
const {
  createSubject,
  getSubjects,
  updateSubject,
  bulkAssignSubject,
  bulkUploadSubjects,
  deleteSubject
} = require("../controllers/subjectController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get("/", getSubjects);

// Admin / Management only
router.use(authorizeRoles("admin", "hod", "dean", "principal"));

router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);
router.post("/bulk-assign", bulkAssignSubject);
router.post("/bulk-upload", upload.single("file"), bulkUploadSubjects);

module.exports = router;
