const { body, validationResult } = require("express-validator");

const validateSchedule = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("scheduleType")
    .isIn(["CRT", "Workshop", "Orientation", "Guest Lecture", "Placement", "Exam", "Other"])
    .withMessage("Invalid schedule type"),

  body("date")
    .isISO8601()
    .withMessage("Valid date is required")
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new Error("Date must be today or in the future");
      }
      return true;
    }),

  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format"),

  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format")
    .custom((value, { req }) => {
      if (value <= req.body.startTime) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("venue")
    .trim()
    .notEmpty()
    .withMessage("Venue is required")
    .isLength({ max: 100 })
    .withMessage("Venue cannot exceed 100 characters"),

  body("audience")
    .isIn([
      "all",
      "students",
      "faculty",
      "cse",
      "ece",
      "eee",
      "mech",
      "civil",
      "1st-year",
      "2nd-year",
      "3rd-year",
      "4th-year",
    ])
    .withMessage("Invalid audience"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateScheduleUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Valid date is required")
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new Error("Date must be today or in the future");
      }
      return true;
    }),

  body("endTime")
    .optional()
    .custom((value, { req }) => {
      if (value && req.body.startTime && value <= req.body.startTime) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateSchedule, validateScheduleUpdate };