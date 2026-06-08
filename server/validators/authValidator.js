const { body } = require("express-validator");

const registerValidation = [

  body("name")
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("rollNumber")
    .notEmpty()
    .withMessage("Roll Number required")

];

module.exports = {
  registerValidation
};