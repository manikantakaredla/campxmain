const express = require("express");
const router = express.Router();
const { uploadFile } = require("../controllers/uploadController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", protect, authorizeRoles("faculty", "hod", "deputyhod", "dean", "principal", "admin"), upload.single("file"), uploadFile);

module.exports = router;