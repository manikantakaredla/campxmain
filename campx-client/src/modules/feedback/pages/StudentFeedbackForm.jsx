import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { LogOut, CheckCircle2 } from 'lucide-react';

const StudentFeedbackForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]); // [{ facultyId, answers: [{questionId, rating}], suggestions }]
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await api.get('/feedback/student/forms');
      if (res.data.alreadySubmitted) {
        navigate('/student/feedback/already-submitted', { replace: true });
        return;
      }
      
      setData(res.data);
      
      // Initialize forms
      const initialFeedbacks = res.data.assignments.map(a => ({
        facultyId: a.facultyId,
        answers: res.data.questions.filter(q => q.type === 'scale').map(q => ({
          questionId: q._id,
          rating: 0
        })),
        suggestions: ''
      }));
      setFeedbacks(initialFeedbacks);
    } catch (error) {
      toast.error('Failed to load feedback forms.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (facultyId, questionId, rating) => {
    setFeedbacks(prev => prev.map(f => {
      if (f.facultyId === facultyId) {
        return {
          ...f,
          answers: f.answers.map(a => a.questionId === questionId ? { ...a, rating } : a)
        };
      }
      return f;
    }));
  };

  const handleSuggestionChange = (facultyId, value) => {
    setFeedbacks(prev => prev.map(f => {
      if (f.facultyId === facultyId) {
        return { ...f, suggestions: value };
      }
      return f;
    }));
  };

  const handleSubmit = async () => {
    // Validate
    let isValid = true;
    for (const f of feedbacks) {
      for (const a of f.answers) {
        if (a.rating === 0) {
          isValid = false;
          break;
        }
      }
    }

    if (!isValid) {
      toast.error('Please complete all ratings for all faculty members before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/feedback/student/submit', { feedbacks });
      navigate('/student/feedback/success', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback.');
      if (error.response?.status === 400) {
        // Might be already submitted
        fetchForms();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Faculty Feedback System</h1>
            <p className="text-blue-100 text-sm mt-1">{data.student.rollNumber} • {data.student.timetable}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-blue-800 text-sm font-medium">
            Please provide your honest feedback for the following faculty members. Your responses are strictly confidential and will be used solely for quality improvement. All ratings are mandatory.
          </p>
        </div>

        <div className="space-y-8">
          {data.assignments.map((assignment, index) => {
            const currentFeedback = feedbacks.find(f => f.facultyId === assignment.facultyId);
            const scaleQuestions = data.questions.filter(q => q.type === 'scale');

            return (
              <div key={assignment.facultyId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{assignment.facultyName}</h2>
                      <p className="text-gray-500 text-sm">{assignment.courseName} ({assignment.courseCode})</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {scaleQuestions.map((q, qIndex) => {
                    const currentRating = currentFeedback?.answers.find(a => a.questionId === q._id)?.rating || 0;
                    return (
                      <div key={q._id} className="space-y-3">
                        <label className="block text-sm font-medium text-gray-800">
                          {qIndex + 1}. {q.questionText}
                        </label>
                        <div className="flex gap-2 sm:gap-4 flex-wrap">
                          {Object.entries({1: 'Poor', 2: 'Average', 3: 'Good', 4: 'Excellent', 5: 'Very Excellent'}).map(([value, label]) => {
                            const rating = parseInt(value);
                            return (
                              <button
                                key={rating}
                                onClick={() => handleRatingChange(assignment.facultyId, q._id, rating)}
                                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                                  currentRating === rating 
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Any additional suggestions or comments? (Optional)
                    </label>
                    <textarea
                      value={currentFeedback?.suggestions || ''}
                      onChange={(e) => handleSuggestionChange(assignment.facultyId, e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Type your feedback here..."
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-lg shadow-green-600/20"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircle2 size={20} />
            )}
            Submit All Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackForm;
