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
    const allAnswers = await FeedbackAnswer.find();
    const questions = await FeedbackQuestion.find({ type: 'scale' }).sort({ order: 1 });
    
    // facultyId -> { facultyName, questionAverages: { qId: avg } }
    const facultyMap = {};

    allAnswers.forEach(answerDoc => {
      if (!facultyMap[answerDoc.facultyId]) {
        facultyMap[answerDoc.facultyId] = {
          facultyName: answerDoc.facultyName,
          qStats: {}
        };
      }
      
      const f = facultyMap[answerDoc.facultyId];
      answerDoc.answers.forEach(ans => {
        if (!f.qStats[ans.questionId]) {
          f.qStats[ans.questionId] = { sum: 0, count: 0 };
        }
        f.qStats[ans.questionId].sum += ans.rating;
        f.qStats[ans.questionId].count++;
      });
    });

    // Format for heatmap
    const heatmapData = Object.values(facultyMap).map(f => {
      const row = { facultyName: f.facultyName };
      questions.forEach(q => {
        const stats = f.qStats[q._id];
        row[q._id] = stats && stats.count > 0 ? (stats.sum / stats.count).toFixed(2) : null;
      });
      return row;
    });

    res.status(200).json({ success: true, heatmapData, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
