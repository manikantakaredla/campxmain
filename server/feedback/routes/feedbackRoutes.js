const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const studentRoutes = require("./studentRoutes");
const adminRoutes = require("./adminRoutes");

router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
