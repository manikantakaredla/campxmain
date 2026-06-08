const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerFaculty,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const { studentRegisterValidation, facultyRegisterValidation, loginValidation, otpValidation } = require("../utils/validators");

router.post("/register/student", studentRegisterValidation, validate, registerStudent);
router.post("/register/faculty", facultyRegisterValidation, validate, registerFaculty);
router.post("/verify-otp", otpValidation, validate, verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginValidation, validate, loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;