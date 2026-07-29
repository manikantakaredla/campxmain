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
    const getSubjectKey = (doc) => {
      if (doc.courseCode) return doc.courseCode; // strictly use course code if available
      
      const courseName = doc.courseName;
      if (!courseName) return 'Other';
      const c = courseName.toLowerCase();
      if (c.includes('fundamentals of data science') || c.includes('fds')) return 'Fundamentals of Data Science';
      if (c.includes('engineering economics') || c.includes('eem')) return 'Engineering Economics & Management';
      if (c.includes('information retrieval') || c.includes('irs')) return 'Information Retrieval Systems';
      if (c.includes('computer networks') || c.includes('cn')) return 'Computer Networks';
      if (c.includes('compiler design') || c.includes('cd')) return 'Compiler Design';
      if (c.includes('machine learning') || c.includes('ml')) return 'Machine Learning';
      if (c.includes('ooad') || c.includes('object oriented')) return 'OOAD';
      return courseName;
    };

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
          qStats: {},
          suggestions: [],
          subjects: {}
        };
      }
      
      timetablesMap[tt].faculties[fId].totalStudentsAssigned++;
      
      const subjKey = getSubjectKey(a);
      if (!timetablesMap[tt].faculties[fId].subjects[subjKey]) {
        timetablesMap[tt].faculties[fId].subjects[subjKey] = { total: 0, submitted: 0, ratingSum: 0, ratingCount: 0 };
      }
      timetablesMap[tt].faculties[fId].subjects[subjKey].total++;
    });
    
    // Populate answers
    answers.forEach(ansDoc => {
      const tt = ansDoc.timetable;
      const fId = ansDoc.facultyId;
      if (!tt || !timetablesMap[tt] || !timetablesMap[tt].faculties[fId]) return;
      
      const f = timetablesMap[tt].faculties[fId];
      f.submittedStudents++;
      
      const subjKey = getSubjectKey(ansDoc);
      if (f.subjects[subjKey]) {
        f.subjects[subjKey].submitted++;
      }
      
      ansDoc.answers.forEach(a => {
        if (!f.qStats[a.questionId]) {
          f.qStats[a.questionId] = { sum: 0, count: 0 };
        }
        f.qStats[a.questionId].sum += a.rating;
        f.qStats[a.questionId].count++;

        if (f.subjects[subjKey]) {
          f.subjects[subjKey].ratingSum += a.rating;
          f.subjects[subjKey].ratingCount++;
        }
      });

      if (ansDoc.suggestions && ansDoc.suggestions.trim().length > 0) {
        f.suggestions.push(ansDoc.suggestions.trim());
      }
    });
    
    // Format response
    const formattedTimetables = Object.values(timetablesMap).map(tt => {
      const faculties = Object.values(tt.faculties).map(f => {
        const questionScores = {};
        const questionPercentages = {};
        questions.forEach(q => {
          const stats = f.qStats[q._id];
          questionScores[q._id] = stats && stats.count > 0 ? (stats.sum / stats.count).toFixed(2) : null;
          questionPercentages[q._id] = stats && stats.count > 0 ? ((stats.sum / stats.count) * 20).toFixed(1) : null;
        });
        
        // Subject percentages
        Object.keys(f.subjects).forEach(sKey => {
          const sObj = f.subjects[sKey];
          if (sObj.ratingCount > 0) {
            sObj.percentage = ((sObj.ratingSum / sObj.ratingCount) * 20).toFixed(1);
          } else {
            sObj.percentage = null;
          }
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
          questionScores,
          questionPercentages,
          suggestions: f.suggestions,
          subjects: f.subjects
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

exports.getFacultyStudentResponses = async (req, res) => {
  try {
    const { timetable, facultyId } = req.query;
    if (!timetable || !facultyId) {
      return res.status(400).json({ success: false, message: 'Timetable and facultyId required' });
    }

    // 1. Get all questions to map questionId -> Text, and get max scale for percentage/text mapping
    const questions = await FeedbackQuestion.find({ type: 'scale' }).sort({ order: 1 });
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    const getRatingText = (rating) => {
      if (!rating) return 'N/A';
      if (rating === 1) return 'Poor';
      if (rating === 2) return 'Fair';
      if (rating === 3) return 'Good';
      if (rating === 4) return 'Very Good';
      if (rating === 5) return 'Excellent';
      return rating.toString();
    };

    // 2. Get all assignments for this faculty & timetable
    let query = { timetable, facultyId };
    const subject = req.query.subject;
    const courseCode = req.query.courseCode;
    let subjectCondition = null;
    
    if (courseCode) {
      query.courseCode = courseCode;
      subjectCondition = [{ courseCode: courseCode }];
    } else if (subject) {
      if (subject.toLowerCase() === 'fundamentals of data science') {
        subjectCondition = [{ courseName: /fundamentals of data science/i }, { courseName: /fds/i }, { courseCode: /fds/i }];
      } else if (subject.toLowerCase() === 'engineering economics & management') {
        subjectCondition = [{ courseName: /engineering economics/i }, { courseName: /eem/i }, { courseCode: /eem/i }];
      } else if (subject.toLowerCase() === 'information retrieval systems') {
        subjectCondition = [{ courseName: /information retrieval/i }, { courseName: /irs/i }, { courseCode: /irs/i }];
      } else if (subject.toLowerCase() === 'computer networks') {
        subjectCondition = [{ courseName: /computer networks/i }, { courseName: /cn/i }, { courseCode: /cn/i }];
      } else if (subject.toLowerCase() === 'compiler design') {
        subjectCondition = [{ courseName: /compiler design/i }, { courseName: /cd/i }, { courseCode: /cd/i }];
      } else if (subject.toLowerCase() === 'machine learning') {
        subjectCondition = [{ courseName: /machine learning/i }, { courseName: /ml/i }, { courseCode: /ml/i }];
      } else if (subject.toLowerCase() === 'ooad') {
        subjectCondition = [{ courseName: /ooad/i }, { courseName: /object oriented/i }, { courseCode: /ooad/i }];
      } else {
        subjectCondition = [{ courseName: new RegExp(subject, 'i') }];
      }
      query.$or = subjectCondition;
    }
    const assignments = await FeedbackAssignment.find(query);
    const assignedRollNumbers = assignments.map(a => a.studentRollNo);

    // 3. Get all answers for these students & this faculty
    let answerQuery = { timetable, facultyId, rollNumber: { $in: assignedRollNumbers } };
    if (courseCode) {
      answerQuery.courseCode = courseCode;
    } else if (subjectCondition) {
      answerQuery.$or = subjectCondition;
    }
    const answers = await FeedbackAnswer.find(answerQuery);
    
    // Map answer by roll number
    const answerMap = {};
    const stats = {
      'Poor': 0,
      'Fair': 0,
      'Good': 0,
      'Very Good': 0,
      'Excellent': 0
    };

    answers.forEach(ans => {
      const qAnswers = {};
      ans.answers.forEach(a => {
        const text = getRatingText(a.rating);
        qAnswers[a.questionId.toString()] = text;
        if (stats[text] !== undefined) {
          stats[text]++;
        }
      });
      answerMap[ans.rollNumber] = {
        answers: qAnswers,
        suggestions: ans.suggestions
      };
    });

    // 4. Build student list
    const studentsList = assignedRollNumbers.map(roll => {
      const submitted = !!answerMap[roll];
      return {
        rollNumber: roll,
        status: submitted ? 'Given' : 'Not Given',
        answers: submitted ? answerMap[roll].answers : {},
        suggestions: submitted ? answerMap[roll].suggestions : ''
      };
    });

    res.status(200).json({
      success: true,
      students: studentsList,
      stats,
      questions
    });

  } catch (error) {
    console.error('Error fetching faculty student responses:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
