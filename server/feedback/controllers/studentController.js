const FeedbackStudent = require("../models/FeedbackStudent");
const FeedbackAssignment = require("../models/FeedbackAssignment");
const FeedbackQuestion = require("../models/FeedbackQuestion");
const FeedbackSubmission = require("../models/FeedbackSubmission");
const FeedbackAnswer = require("../models/FeedbackAnswer");

exports.getFeedbackForms = async (req, res) => {
  try {
    const { rollNumber } = req;

    // Check if student already submitted
    const existingSubmission = await FeedbackSubmission.findOne({ rollNumber });
    if (existingSubmission) {
      return res.status(200).json({
        success: true,
        alreadySubmitted: true,
      });
    }

    // Get student details
    const student = await FeedbackStudent.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Get assignments for this student
    const assignments = await FeedbackAssignment.find({ studentRollNo: rollNumber });

    // Get active questions
    const questions = await FeedbackQuestion.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      alreadySubmitted: false,
      student: {
        rollNumber: student.rollNumber,
        collegeEmail: student.collegeEmail,
        timetable: student.timetable,
      },
      assignments,
      questions,
    });
  } catch (error) {
    console.error("getFeedbackForms error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { rollNumber } = req;
    const { feedbacks } = req.body; 
    // feedbacks should be an array of { facultyId, answers: [{questionId, rating}], suggestions }

    // 1. Double check for existing submission to prevent race conditions (DB Unique Index will also catch it)
    const existingSubmission = await FeedbackSubmission.findOne({ rollNumber });
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted your feedback.",
      });
    }

    // 2. Validate assignments
    const assignments = await FeedbackAssignment.find({ studentRollNo: rollNumber });
    if (feedbacks.length !== assignments.length) {
      return res.status(400).json({
        success: false,
        message: "Incomplete feedback. You must provide feedback for all assigned faculties.",
      });
    }

    // 3. Create the Submission Record
    const submission = await FeedbackSubmission.create({
      rollNumber,
      clientIp: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // 4. Create the Answer Records
    const answerDocs = feedbacks.map(fb => {
      const assignment = assignments.find(a => a.facultyId === fb.facultyId);
      if (!assignment) {
        throw new Error(`Invalid faculty ID ${fb.facultyId} for this student`);
      }
      return {
        submissionId: submission._id,
        rollNumber,
        facultyId: assignment.facultyId,
        facultyName: assignment.facultyName,
        courseCode: assignment.courseCode,
        courseName: assignment.courseName,
        timetable: assignment.timetable,
        answers: fb.answers,
        suggestions: fb.suggestions
      };
    });

    await FeedbackAnswer.insertMany(answerDocs);

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully.",
    });
  } catch (error) {
    console.error("submitFeedback error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already submitted your feedback." });
    }
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
