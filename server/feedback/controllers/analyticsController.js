const FeedbackAnswer = require("../models/FeedbackAnswer");
const FeedbackSubmission = require("../models/FeedbackSubmission");
const FeedbackStudent = require("../models/FeedbackStudent");
const FeedbackQuestion = require("../models/FeedbackQuestion");
const FeedbackAssignment = require("../models/FeedbackAssignment");

exports.getDashboardOverview = async (req, res) => {
  try {
    const totalImported = await FeedbackStudent.countDocuments();
    const totalSubmitted = await FeedbackSubmission.countDocuments();
    const pending = totalImported - totalSubmitted;
    const submissionPercent = totalImported > 0 ? ((totalSubmitted / totalImported) * 100).toFixed(1) : 0;

    // Average rating overall
    const allAnswers = await FeedbackAnswer.find();
    let totalRatings = 0;
    let countRatings = 0;

    // Group by faculty
    const facultyMap = new Map();

    allAnswers.forEach(answerDoc => {
      answerDoc.answers.forEach(ans => {
        if (ans.rating > 0) {
          totalRatings += ans.rating;
          countRatings++;

          if (!facultyMap.has(answerDoc.facultyId)) {
            facultyMap.set(answerDoc.facultyId, { name: answerDoc.facultyName, sum: 0, count: 0 });
          }
          const f = facultyMap.get(answerDoc.facultyId);
          f.sum += ans.rating;
          f.count++;
        }
      });
    });

    const averageRating = countRatings > 0 ? (totalRatings / countRatings).toFixed(2) : 0;

    let highestRated = { name: "N/A", rating: 0 };
    let lowestRated = { name: "N/A", rating: 5 };

    facultyMap.forEach(f => {
      const avg = f.sum / f.count;
      if (avg > highestRated.rating) highestRated = { name: f.name, rating: avg.toFixed(2) };
      if (avg < lowestRated.rating) lowestRated = { name: f.name, rating: avg.toFixed(2) };
    });

    if (lowestRated.rating === 5 && countRatings === 0) lowestRated.rating = 0;

    res.status(200).json({
      success: true,
      stats: {
        totalImported,
        totalSubmitted,
        pending,
        submissionPercent,
        averageRating,
        highestRated,
        lowestRated
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getHeatmap = async (req, res) => {
  try {
    const { groupBy = 'faculty' } = req.query; // 'faculty', 'timetable', 'course', 'student', 'facultyId'

    const allAnswers = await FeedbackAnswer.find();
    const questions = await FeedbackQuestion.find({ type: 'scale' }).sort({ order: 1 });
    
    const groupMap = {};

    allAnswers.forEach(answerDoc => {
      let key, displayName;
      
      switch (groupBy) {
        case 'timetable':
          key = answerDoc.timetable;
          displayName = answerDoc.timetable;
          break;
        case 'course':
          key = answerDoc.courseCode;
          displayName = `${answerDoc.courseName} (${answerDoc.courseCode})`;
          break;
        case 'student':
          key = answerDoc.rollNumber;
          displayName = answerDoc.rollNumber;
          break;
        case 'facultyId':
          key = answerDoc.facultyId;
          displayName = answerDoc.facultyId;
          break;
        case 'faculty':
        default:
          key = answerDoc.facultyId;
          displayName = `${answerDoc.facultyName} (${answerDoc.facultyId})`;
          break;
      }

      if (!key) return; // Skip if missing data

      if (!groupMap[key]) {
        groupMap[key] = {
          displayName,
          qStats: {}
        };
      }
      
      const g = groupMap[key];
      answerDoc.answers.forEach(ans => {
        if (!g.qStats[ans.questionId]) {
          g.qStats[ans.questionId] = { sum: 0, count: 0 };
        }
        g.qStats[ans.questionId].sum += ans.rating;
        g.qStats[ans.questionId].count++;
      });
    });

    // Format for heatmap
    const heatmapData = Object.values(groupMap).map(g => {
      const row = { name: g.displayName };
      questions.forEach(q => {
        const stats = g.qStats[q._id];
        row[q._id] = stats && stats.count > 0 ? (stats.sum / stats.count).toFixed(2) : null;
      });
      return row;
    });

    // Sort alphabetically by name for better readability
    heatmapData.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({ success: true, heatmapData, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
