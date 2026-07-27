const jwt = require("jsonwebtoken");
const FeedbackStudent = require("../models/FeedbackStudent");

const protectFeedback = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token for feedback",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.rollNumber = decoded.rollNumber;

    if (decoded.role !== 'student_feedback') {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Not a feedback student.",
      });
    }

    // Verify student exists in master data
    const student = await FeedbackStudent.findOne({ rollNumber: decoded.rollNumber });
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Student record not found in imported data",
      });
    }

    next();
  } catch (error) {
    console.error("Feedback Auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

module.exports = protectFeedback;
