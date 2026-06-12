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
  getMe,
  updateProfile,
  updateProfilePicture,
  changePassword
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const { studentRegisterValidation, facultyRegisterValidation, loginValidation, otpValidation } = require("../utils/validators");

router.post("/register/student", studentRegisterValidation, validate, registerStudent);
router.post("/register/faculty", facultyRegisterValidation, validate, registerFaculty);
router.post("/verify-otp", otpValidation, validate, verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginValidation, validate, loginUser);
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/profile/picture", protect, upload.single("file"), updateProfilePicture);
router.put("/change-password", protect, changePassword);

module.exports = router;