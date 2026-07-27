const FeedbackStudent = require("../models/FeedbackStudent");
const FeedbackAssignment = require("../models/FeedbackAssignment");
const FeedbackConfig = require("../models/FeedbackConfig");
const FeedbackImportHistory = require("../models/FeedbackImportHistory");
const FeedbackQuestion = require("../models/FeedbackQuestion");
const mongoose = require("mongoose");
const crypto = require("crypto");

exports.importMasterData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rows, importType, fileName } = req.body;
    // importType: 'replace', 'append', 'update'
    // rows: [{ timetable, courseCode, courseName, facultyName, rollNumber }]

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: "No data provided" });
    }

    if (importType === "replace") {
      await FeedbackStudent.deleteMany({}, { session });
      await FeedbackAssignment.deleteMany({}, { session });
    }

    let importedCount = 0;
    const studentsMap = new Map();
    const assignments = [];

    // Process rows
    for (const row of rows) {
      const rollNumber = row.rollNumber.toString().trim().toUpperCase();
      const collegeEmail = `${rollNumber.toLowerCase()}@adityauniversity.in`;
      const timetable = row.timetable.toString().trim();
      
      if (!studentsMap.has(rollNumber)) {
        studentsMap.set(rollNumber, {
          rollNumber,
          collegeEmail,
          timetable
        });
      }

      const facultyName = row.facultyName.toString().trim();
      let facultyId = row.facultyId ? row.facultyId.toString().trim() : 
        crypto.createHash('md5').update(facultyName.toLowerCase()).digest('hex').substring(0, 10);

      assignments.push({
        studentRollNo: rollNumber,
        facultyId,
        facultyName,
        courseCode: row.courseCode.toString().trim(),
        courseName: row.courseName.toString().trim(),
        timetable
      });
    }

    // Upsert Students
    const studentOps = Array.from(studentsMap.values()).map(student => ({
      updateOne: {
        filter: { rollNumber: student.rollNumber },
        update: { $set: student },
        upsert: true
      }
    }));
    if (studentOps.length > 0) {
      await FeedbackStudent.bulkWrite(studentOps, { session });
    }

    if (importType === "replace") {
      await FeedbackAssignment.insertMany(assignments, { session });
      importedCount = assignments.length;
    } else {
      const assignmentOps = assignments.map(a => ({
        updateOne: {
          filter: { studentRollNo: a.studentRollNo, courseCode: a.courseCode },
          update: { $set: a },
          upsert: true
        }
      }));
      if (assignmentOps.length > 0) {
        await FeedbackAssignment.bulkWrite(assignmentOps, { session });
        importedCount = assignments.length;
      }
    }

    await FeedbackImportHistory.create([{
      fileName: fileName || "Manual Import",
      uploadedBy: req.user._id,
      rowsImported: importedCount,
      status: "success"
    }], { session });

    await session.commitTransaction();
    res.status(200).json({ success: true, message: `Successfully imported ${importedCount} records.`, importedCount });
  } catch (error) {
    await session.abortTransaction();
    console.error("importMasterData error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  } finally {
    session.endSession();
  }
};

exports.getConfig = async (req, res) => {
  try {
    let config = await FeedbackConfig.findOne();
    if (!config) {
      config = await FeedbackConfig.create({
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }
    res.status(200).json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const config = await FeedbackConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.status(200).json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getImportHistory = async (req, res) => {
  try {
    const history = await FeedbackImportHistory.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Question management
exports.getQuestions = async (req, res) => {
  try {
    const questions = await FeedbackQuestion.find().sort({ order: 1 });
    res.status(200).json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const question = await FeedbackQuestion.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await FeedbackQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await FeedbackQuestion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
