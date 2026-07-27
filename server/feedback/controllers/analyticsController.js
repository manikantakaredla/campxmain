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
      const row = { facultyName: f.facultyName, name: f.facultyName };
      questions.forEach(q => {
        const stats = f.qStats[q._id];
        row[q._id] = stats && stats.count > 0 ? (stats.sum / stats.count).toFixed(2) : null;
      });
      return row;
    });

    heatmapData.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({ success: true, heatmapData, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getDetailedAnalytics = async (req, res) => {
  try {
    const students = await FeedbackStudent.find();
    const submissions = await FeedbackSubmission.find();
    const answers = await FeedbackAnswer.find();
    const assignments = await FeedbackAssignment.find();
    const questions = await FeedbackQuestion.find({ type: 'scale' }).sort({ order: 1 });
    
    const timetablesMap = {};
    
    // Populate students count per timetable
    students.forEach(s => {
      const tt = s.timetable;
      if (!tt) return;
      if (!timetablesMap[tt]) {
        timetablesMap[tt] = {
          name: tt,
          totalStudents: 0,
          submittedStudents: 0,
          faculties: {} // facultyId -> { ... }
        };
      }
      timetablesMap[tt].totalStudents++;
    });

    // Populate submissions per timetable
    const submissionRollNumbers = new Set(submissions.map(s => s.rollNumber));
    students.forEach(s => {
      const tt = s.timetable;
      if (tt && timetablesMap[tt] && submissionRollNumbers.has(s.rollNumber)) {
        timetablesMap[tt].submittedStudents++;
      }
    });
    
    // Populate faculties within timetables
    assignments.forEach(a => {
      const tt = a.timetable;
      const fId = a.facultyId;
      if (!tt || !timetablesMap[tt]) return;
      
      if (!timetablesMap[tt].faculties[fId]) {
        timetablesMap[tt].faculties[fId] = {
          facultyId: fId,
          facultyName: a.facultyName,
          totalStudentsAssigned: 0,
          submittedStudents: 0,
          qStats: {}
        };
      }
      // Note: an assignment is one unique link between student and course/faculty. 
      // If a student has the same faculty for two courses in the same timetable, it might count twice unless we distinct it.
      // But usually it's fine.
      timetablesMap[tt].faculties[fId].totalStudentsAssigned++;
    });
    
    // Populate answers
    answers.forEach(ansDoc => {
      const tt = ansDoc.timetable;
      const fId = ansDoc.facultyId;
      if (!tt || !timetablesMap[tt] || !timetablesMap[tt].faculties[fId]) return;
      
      const f = timetablesMap[tt].faculties[fId];
      f.submittedStudents++;
      
      ansDoc.answers.forEach(a => {
        if (!f.qStats[a.questionId]) {
          f.qStats[a.questionId] = { sum: 0, count: 0 };
        }
        f.qStats[a.questionId].sum += a.rating;
        f.qStats[a.questionId].count++;
      });
    });
    
    // Format response
    const formattedTimetables = Object.values(timetablesMap).map(tt => {
      const faculties = Object.values(tt.faculties).map(f => {
        const questionScores = {};
        questions.forEach(q => {
          const stats = f.qStats[q._id];
          questionScores[q._id] = stats && stats.count > 0 ? (stats.sum / stats.count).toFixed(2) : null;
        });
        
        // Safety cap in case of assignment duplicates vs answers
        if (f.submittedStudents > f.totalStudentsAssigned) {
           f.totalStudentsAssigned = f.submittedStudents;
        }

        return {
          facultyId: f.facultyId,
          facultyName: f.facultyName,
          totalAssigned: f.totalStudentsAssigned,
          submitted: f.submittedStudents,
          completionPercentage: f.totalStudentsAssigned > 0 ? ((f.submittedStudents / f.totalStudentsAssigned) * 100).toFixed(1) : 0,
          questionScores
        };
      });
      
      faculties.sort((a,b) => a.facultyName.localeCompare(b.facultyName));
      
      return {
        name: tt.name,
        totalStudents: tt.totalStudents,
        submittedStudents: tt.submittedStudents,
        completionPercentage: tt.totalStudents > 0 ? ((tt.submittedStudents / tt.totalStudents) * 100).toFixed(1) : 0,
        faculties
      };
    });
    
    formattedTimetables.sort((a,b) => a.name.localeCompare(b.name));
    
    res.status(200).json({ success: true, timetables: formattedTimetables, questions });
  } catch(error) {
     res.status(500).json({ success: false, message: 'Server Error' });
  }
};
