const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP, refreshToken } = require("../controllers/authController");
const protectFeedback = require("../middleware/feedbackAuthMiddleware");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/refresh-token", protectFeedback, refreshToken);

module.exports = router;
