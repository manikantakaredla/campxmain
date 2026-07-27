const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const FeedbackStudent = require("../models/FeedbackStudent");
const FeedbackOTP = require("../models/FeedbackOTP");
const FeedbackConfig = require("../models/FeedbackConfig");
const { sendEmail } = require("../../utils/sendEmail");

// Helper to check if feedback is enabled
const checkFeedbackEnabled = async () => {
  const config = await FeedbackConfig.findOne();
  if (!config) return false;
  
  if (!config.isCollectionEnabled || !config.isLoginAllowed) {
    return false;
  }

  const now = new Date();
  if (now < config.startDate || now > config.endDate) {
    return false;
  }
  
  return true;
};

exports.sendOTP = async (req, res) => {
  try {
    const { emailOrRollNo } = req.body;
    if (!emailOrRollNo) {
      return res.status(400).json({ success: false, message: "Please provide your Roll Number or College Email" });
    }

    const isEnabled = await checkFeedbackEnabled();
    if (!isEnabled) {
      return res.status(403).json({ success: false, message: "Feedback collection is currently closed." });
    }

    const identifier = emailOrRollNo.trim().toLowerCase();
    
    // Find student by roll number or email
    const student = await FeedbackStudent.findOne({
      $or: [
        { rollNumber: identifier.toUpperCase() },
        { collegeEmail: identifier }
      ]
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "You are not eligible to submit feedback. Please contact the administrator." 
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await FeedbackOTP.findOneAndUpdate(
      { email: student.collegeEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send email using existing utility
    try {
      await sendEmail({
        email: student.collegeEmail,
        subject: "Your Feedback Login OTP - Aditya University",
        message: `Your OTP for accessing the Feedback System is: ${otp}\n\nThis OTP will expire in 5 minutes.`
      });
    } catch (err) {
      console.error("Error sending OTP email:", err);
      return res.status(500).json({ success: false, message: "Failed to send OTP email. Please try again." });
    }

    res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully to your college email.",
      email: student.collegeEmail // Return masked email ideally, but full is fine for now
    });
  } catch (error) {
    console.error("sendOTP error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Please provide email and OTP" });
    }

    const isEnabled = await checkFeedbackEnabled();
    if (!isEnabled) {
      return res.status(403).json({ success: false, message: "Feedback collection is currently closed." });
    }

    const otpRecord = await FeedbackOTP.findOne({ email: email.toLowerCase() });
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > otpRecord.expiresAt) {
      await FeedbackOTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Get student details for the token payload
    const student = await FeedbackStudent.findOne({ collegeEmail: email.toLowerCase() });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found" });
    }

    // Generate JWT (15 minutes)
    const token = jwt.sign(
      { 
        rollNumber: student.rollNumber,
        email: student.collegeEmail,
        role: 'student_feedback'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Clean up used OTP
    await FeedbackOTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      token,
      student: {
        rollNumber: student.rollNumber,
        email: student.collegeEmail,
        timetable: student.timetable
      }
    });

  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.refreshToken = async (req, res) => {
  // If request hits here, they passed the middleware meaning token is valid
  // Just generate a fresh 15min token
  try {
    const token = jwt.sign(
      { 
        rollNumber: req.user.rollNumber,
        email: req.user.email,
        role: 'student_feedback'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("refreshToken error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
