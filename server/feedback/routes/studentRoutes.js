const express = require("express");
const router = express.Router();
const { getFeedbackForms, submitFeedback } = require("../controllers/studentController");
const protectFeedback = require("../middleware/feedbackAuthMiddleware");

router.get("/forms", protectFeedback, getFeedbackForms);
router.post("/submit", protectFeedback, submitFeedback);

module.exports = router;
