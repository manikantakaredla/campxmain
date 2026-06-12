const { body } = require("express-validator");

// Email domain validator
const isValidCollegeEmail = (email) => {
  return email && email.toLowerCase().endsWith("@adityauniversity.in");
};

// Student registration validators
const studentRegisterValidation = [
  body("rollNumber")
    .notEmpty().withMessage("Roll number is required")
    .isAlphanumeric().withMessage("Roll number must be alphanumeric"),
  body("email")
    .isEmail().withMessage("Valid email is required")
    .custom(isValidCollegeEmail).withMessage("Email must be @adityauniversity.in"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match")
];

// Faculty registration validators
const facultyRegisterValidation = [
  body("employeeId")
    .notEmpty().withMessage("Employee ID is required"),
  body("email")
    .isEmail().withMessage("Valid email is required")
    .custom(isValidCollegeEmail).withMessage("Email must be @adityauniversity.in"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match")
];

// Login validators
const loginValidation = [
  body("rollNoOrEmpId").notEmpty().withMessage("Roll No / Employee ID is required"),
  body("password").notEmpty().withMessage("Password is required")
];

// OTP validators
const otpValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
];

module.exports = {
  isValidCollegeEmail,
  studentRegisterValidation,
  facultyRegisterValidation,
  loginValidation,
  otpValidation
};