import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { BarChart, Users, Star, TrendingUp, Download, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const FeedbackAnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, detailedRes] = await Promise.all([
        api.get('/feedback/admin/analytics/overview'),
        api.get('/feedback/admin/analytics/detailed')
      ]);
      
      setStats(overviewRes.data.stats);
      
      const timetables = detailedRes.data.timetables;
      
      const facList = [];
      const ttList = timetables.map(tt => {
         let ttSum = 0;
         let ttCount = 0;
         tt.faculties.forEach(f => {
            let sum = 0, count = 0;
            if (f.questionScores) {
               Object.values(f.questionScores).forEach(s => {
                  if (s) {
                     sum += parseFloat(s);
                     count++;
                     ttSum += parseFloat(s);
                     ttCount++;
                  }
               });
            }
            const overallPct = count > 0 ? (sum / count) * 20 : 0;
            facList.push({
               facultyName: f.facultyName,
               roomNo: f.roomNo || 'N/A',
               timetable: tt.name,
               overallPct,
               submitted: f.submitted,
               totalAssigned: f.totalAssigned,
               completionPercentage: parseFloat(f.completionPercentage)
            });
         });
         const ttOverallPct = ttCount > 0 ? (ttSum / ttCount) * 20 : 0;
         return {
            name: tt.name,
            overallPct: ttOverallPct
         };
      });

      const topTimetables = ttList.sort((a,b) => b.overallPct - a.overallPct).slice(0, 5);
      
      const ratedFaculties = facList.filter(f => f.submitted > 0);
      const topFaculties = [...ratedFaculties].sort((a,b) => b.overallPct - a.overallPct).slice(0, 5);
      const leastFaculties = [...ratedFaculties].sort((a,b) => a.overallPct - b.overallPct).slice(0, 5);
      
      const leastRespondedFaculties = [...facList].sort((a,b) => a.completionPercentage - b.completionPercentage).slice(0, 5);

      setDetailedStats({
        topTimetables,
        topFaculties,
        leastFaculties,
        leastRespondedFaculties
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };



  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Analytics</h1>
          <p className="text-gray-500">Monitor submission rates and faculty performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/feedback/detailed-analytics')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Detailed Analytics <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <Users size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 font-medium">Total Submissions</p>
            <h3 className="text-2xl font-bold text-gray-900 truncate">{stats?.totalSubmitted} <span className="text-sm font-normal text-gray-400">/ {stats?.totalImported}</span></h3>
            <p className="text-xs text-green-600 mt-1">{stats?.submissionPercent}% Completion Rate</p>
          </div>
        </div>



        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 font-medium">Highest Percentage Faculty</p>
            <h3 className="text-lg font-bold text-gray-900 truncate" title={stats?.highestRated?.name}>{stats?.highestRated?.name}</h3>
            <p className="text-xs text-green-600 font-medium mt-1">{stats?.highestRated?.rating ? (parseFloat(stats.highestRated.rating) * 20).toFixed(1) : 0}% Rating</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <BarChart size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 font-medium">Lowest Percentage Faculty</p>
            <h3 className="text-lg font-bold text-gray-900 truncate" title={stats?.lowestRated?.name}>{stats?.lowestRated?.name}</h3>
            <p className="text-xs text-red-600 font-medium mt-1">{stats?.lowestRated?.rating ? (parseFloat(stats.lowestRated.rating) * 20).toFixed(1) : 0}% Rating</p>
          </div>
        </div>
      </div>

      {/* 4 Small Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Top Percentage Faculties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            <h3 className="font-bold text-gray-900">Top Percentage Faculties</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold">Faculty Name</th>
                <th className="p-3 font-semibold">Timetable</th>
                <th className="p-3 font-semibold text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detailedStats?.topFaculties.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{f.facultyName}</td>
                  <td className="p-3 text-gray-500">{f.timetable}</td>
                  <td className="p-3 text-right font-bold text-green-600">{f.overallPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Least Percentage Faculties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <TrendingUp size={18} className="text-red-600 rotate-180" />
            <h3 className="font-bold text-gray-900">Least Percentage Faculties</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold">Faculty Name</th>
                <th className="p-3 font-semibold">Timetable</th>
                <th className="p-3 font-semibold text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detailedStats?.leastFaculties.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{f.facultyName}</td>
                  <td className="p-3 text-gray-500">{f.timetable}</td>
                  <td className="p-3 text-right font-bold text-red-600">{f.overallPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Percentage Timetable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Star size={18} className="text-yellow-600" />
            <h3 className="font-bold text-gray-900">Top Percentage Timetables</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold">Timetable</th>
                <th className="p-3 font-semibold text-right">Overall Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detailedStats?.topTimetables.map((tt, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{tt.name}</td>
                  <td className="p-3 text-right font-bold text-indigo-600">{tt.overallPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Least Responded Faculties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Users size={18} className="text-gray-600" />
            <h3 className="font-bold text-gray-900">Least Responded Faculties</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold">Faculty Name</th>
                <th className="p-3 font-semibold">Room No</th>
                <th className="p-3 font-semibold text-right">Response Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detailedStats?.leastRespondedFaculties.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{f.facultyName}</td>
                  <td className="p-3 text-gray-500">{f.roomNo}</td>
                  <td className="p-3 text-right font-bold text-orange-600">{f.completionPercentage.toFixed(1)}% <span className="text-xs text-gray-500 font-normal ml-1">({f.submitted}/{f.totalAssigned})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAnalyticsDashboard;
