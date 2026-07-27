import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { BarChart, Users, Star, TrendingUp, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const FeedbackAnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('faculty'); // faculty, facultyId, timetable, course, student

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, heatmapRes] = await Promise.all([
        api.get('/feedback/admin/analytics/overview'),
        api.get(`/feedback/admin/analytics/heatmap?groupBy=${groupBy}`)
      ]);
      
      setStats(overviewRes.data.stats);
      setHeatmapData(heatmapRes.data.heatmapData);
      setQuestions(heatmapRes.data.questions);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [groupBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getHeatmapColor = (rating) => {
    if (!rating) return 'bg-gray-100 text-gray-400';
    const num = parseFloat(rating);
    if (num >= 4.5) return 'bg-green-100 text-green-800';
    if (num >= 3.5) return 'bg-blue-100 text-blue-800';
    if (num >= 2.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const exportHeatmapCSV = () => {
    if (!heatmapData.length || !questions.length) return;

    let groupLabel = "Details";
    if (groupBy === 'faculty') groupLabel = "Faculty Name";
    if (groupBy === 'facultyId') groupLabel = "Faculty ID";
    if (groupBy === 'timetable') groupLabel = "Timetable";
    if (groupBy === 'course') groupLabel = "Course";
    if (groupBy === 'student') groupLabel = "Roll Number";

    const headers = [groupLabel, ...questions.map((_, i) => `Q${i + 1}`), 'Overall Avg'];
    const rows = heatmapData.map(f => {
      let sum = 0;
      let count = 0;
      const qScores = questions.map(q => {
        const score = f[q._id];
        if (score) {
          sum += parseFloat(score);
          count++;
        }
        return score || 'N/A';
      });
      const avg = count > 0 ? (sum / count).toFixed(2) : 'N/A';
      return [f.name, ...qScores, avg];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `feedback_heatmap_${groupBy}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !stats) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Analytics</h1>
          <p className="text-gray-500">Monitor submission rates and detailed performance metrics.</p>
        </div>
        <button
          onClick={exportHeatmapCSV}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Submissions</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalSubmitted} <span className="text-sm font-normal text-gray-400">/ {stats?.totalImported}</span></h3>
            <p className="text-xs text-green-600 mt-1">{stats?.submissionPercent}% Completion Rate</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Institute Rating</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.averageRating} <span className="text-sm font-normal text-gray-400">/ 5.0</span></h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Highest Rated Faculty</p>
            <h3 className="text-lg font-bold text-gray-900 truncate" title={stats?.highestRated?.name}>{stats?.highestRated?.name}</h3>
            <p className="text-xs text-green-600 font-medium mt-1">{stats?.highestRated?.rating} / 5.0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <BarChart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Lowest Rated Faculty</p>
            <h3 className="text-lg font-bold text-gray-900 truncate" title={stats?.lowestRated?.name}>{stats?.lowestRated?.name}</h3>
            <p className="text-xs text-red-600 font-medium mt-1">{stats?.lowestRated?.rating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Performance Heatmap</h2>
            <p className="text-sm text-gray-500 mt-1">Scores out of 5.0 for each question.</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="faculty">Group by Faculty Name</option>
              <option value="facultyId">Group by Faculty ID</option>
              <option value="timetable">Group by Timetable</option>
              <option value="course">Group by Course Name</option>
              <option value="student">Group by Student Roll Number</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm z-10">
              <div className="text-sm text-gray-500 font-medium">Updating...</div>
            </div>
          )}
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold min-w-[200px]">
                  {groupBy === 'faculty' && "Faculty Details"}
                  {groupBy === 'facultyId' && "Faculty ID"}
                  {groupBy === 'timetable' && "Timetable Name"}
                  {groupBy === 'course' && "Course Details"}
                  {groupBy === 'student' && "Student Roll Number"}
                </th>
                {questions.map((q, i) => (
                  <th key={q._id} className="p-4 font-semibold text-center" title={q.questionText}>
                    Q{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {heatmapData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{row.name}</td>
                  {questions.map(q => {
                    const score = row[q._id];
                    return (
                      <td key={q._id} className="p-2 text-center">
                        <div className={`mx-auto w-12 py-1 rounded font-semibold ${getHeatmapColor(score)}`}>
                          {score ? score : '-'}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {heatmapData.length === 0 && !loading && (
                <tr>
                  <td colSpan={questions.length + 1} className="p-8 text-center text-gray-500">
                    No feedback data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAnalyticsDashboard;
