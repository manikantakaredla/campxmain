import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ChevronDown, ChevronUp, Star, BookOpen, MapPin, Calendar, ArrowRight, TrendingUp, UserCheck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { TIMETABLES_CONFIG } from '../constants/timetablesConfig';

const FeedbackFacultyAnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [facultiesList, setFacultiesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/feedback/admin/analytics/detailed');
      const timetables = res.data.timetables || [];
      const facultyMap = {};

      timetables.forEach(tt => {
        const ttPrefixMatch = tt.name.match(/^T\d+/i);
        const ttPrefix = ttPrefixMatch ? ttPrefixMatch[0].toUpperCase() : null;
        let configKey = null;
        if (ttPrefix) {
          configKey = Object.keys(TIMETABLES_CONFIG).find(k => k.startsWith(ttPrefix));
        } else {
          configKey = Object.keys(TIMETABLES_CONFIG).find(k => 
            tt.name.toLowerCase().includes(k.split(' ')[0].toLowerCase())
          );
        }
        const config = configKey ? TIMETABLES_CONFIG[configKey] : null;

        const ttFaculties = tt.faculties || [];
        ttFaculties.forEach(fac => {
          const fIdStr = String(fac.facultyId);
          if (!facultyMap[fIdStr]) {
            facultyMap[fIdStr] = {
              facultyId: fac.facultyId,
              facultyName: fac.facultyName,
              totalAssigned: 0,
              submittedCount: 0,
              totalRatingSum: 0,
              totalRatingCount: 0,
              assignedItems: []
            };
          }

          const target = facultyMap[fIdStr];
          target.totalAssigned += (fac.totalAssigned || 0);
          target.submittedCount += (fac.submitted || 0);

          const subjKeys = Object.keys(fac.subjects || {});
          if (subjKeys.length === 0) {
            target.assignedItems.push({
              id: `${tt.name}-${fIdStr}-General`,
              timetableName: tt.name,
              subjectName: 'General Evaluation',
              subjectCode: 'GEN',
              roomNo: 'N/A',
              total: fac.totalAssigned || 0,
              submitted: fac.submitted || 0,
              percentage: fac.completionPercentage ? fac.completionPercentage : null
            });
          } else {
            subjKeys.forEach(sKey => {
              const sObj = fac.subjects[sKey] || {};
              let matchedCode = sKey;
              let matchedName = sKey;
              let matchedRoom = 'N/A';

              if (config) {
                if (config.columns) {
                  const col = config.columns.find(c => 
                    c.code.toLowerCase() === sKey.toLowerCase() || 
                    c.name.toLowerCase() === sKey.toLowerCase() ||
                    c.name.toLowerCase().includes(sKey.toLowerCase()) ||
                    sKey.toLowerCase().includes(c.name.toLowerCase())
                  );
                  if (col) {
                    matchedCode = col.code;
                    matchedName = col.name;
                  }
                }
                if (config.rows) {
                  for (const row of config.rows) {
                    const facIdx = row.faculties.findIndex(f => 
                      f.id === String(fac.facultyId) || 
                      (f.name.toLowerCase().replace(/[^a-z0-9]/g, '') === fac.facultyName.toLowerCase().replace(/[^a-z0-9]/g, ''))
                    );
                    if (facIdx !== -1) {
                      const col = config.columns[facIdx];
                      if (col && (
                        col.code.toLowerCase() === sKey.toLowerCase() || 
                        col.name.toLowerCase() === sKey.toLowerCase() ||
                        col.name.toLowerCase().includes(sKey.toLowerCase()) || 
                        sKey.toLowerCase().includes(col.name.toLowerCase())
                      )) {
                        matchedRoom = row.class;
                        break;
                      }
                    }
                  }
                }
              }

              target.assignedItems.push({
                id: `${tt.name}-${fIdStr}-${matchedCode}-${Math.random()}`,
                timetableName: tt.name,
                subjectName: matchedName,
                subjectCode: matchedCode,
                roomNo: matchedRoom,
                total: sObj.total || 0,
                submitted: sObj.submitted || 0,
                percentage: sObj.percentage || null
              });

              if (sObj.ratingCount > 0) {
                target.totalRatingSum += sObj.ratingSum || 0;
                target.totalRatingCount += sObj.ratingCount || 0;
              }
            });
          }
        });
      });

      const processedList = Object.values(facultyMap).map(item => {
        let overallPercentage = null;
        if (item.totalRatingCount > 0) {
          overallPercentage = ((item.totalRatingSum / item.totalRatingCount) * 20).toFixed(1);
        } else {
          const validPcts = item.assignedItems.filter(i => i.percentage && !isNaN(parseFloat(i.percentage)));
          if (validPcts.length > 0) {
            const sum = validPcts.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0);
            overallPercentage = (sum / validPcts.length).toFixed(1);
          }
        }
        return {
          ...item,
          overallPercentage
        };
      });

      processedList.sort((a, b) => a.facultyName.localeCompare(b.facultyName));
      setFacultiesList(processedList);
    } catch (error) {
      toast.error('Failed to load faculty analytics data');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (fId) => {
    setExpandedIds(prev => ({ ...prev, [fId]: !prev[fId] }));
  };

  const handleDrilldown = (faculty, item) => {
    navigate('/admin/feedback/detailed-analytics', {
      state: {
        from: 'faculty-analytics',
        timetableName: item.timetableName,
        facultyId: faculty.facultyId,
        subject: item.subjectName,
        courseCode: item.subjectCode,
        roomNo: item.roomNo
      }
    });
  };

  const getScoreBadge = (pct) => {
    if (!pct) return 'bg-gray-100 text-gray-500 border-gray-200';
    const num = parseFloat(pct);
    if (num >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (num >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (num >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const filteredFaculties = facultiesList.filter(fac => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return fac.facultyName.toLowerCase().includes(q) || String(fac.facultyId).toLowerCase().includes(q);
  });

  const totalEvaluations = facultiesList.reduce((acc, curr) => acc + curr.submittedCount, 0);
  const validScores = facultiesList.filter(f => f.overallPercentage && !isNaN(parseFloat(f.overallPercentage)));
  const avgSystemScore = validScores.length > 0 
    ? (validScores.reduce((acc, curr) => acc + parseFloat(curr.overallPercentage), 0) / validScores.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Aggregating nationwide faculty feedback performance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-indigo-100 text-xs font-semibold uppercase tracking-wider border border-white/10">
                <Users size={14} /> Faculty Evaluation Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Faculty Performance Analytics</h1>
              <p className="text-indigo-100/90 text-sm max-w-2xl font-normal">
                Comprehensive performance breakdown across all institutional timetables. Select any faculty member to inspect assigned subjects, rooms, and drill down into individual student evaluation reports.
              </p>
            </div>
            
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[110px]">
                <div className="text-2xl font-black">{facultiesList.length}</div>
                <div className="text-[11px] text-indigo-200 font-medium mt-0.5">Total Faculty</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[110px]">
                <div className="text-2xl font-black">{totalEvaluations}</div>
                <div className="text-[11px] text-indigo-200 font-medium mt-0.5">Responses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[110px] col-span-2 sm:col-span-1">
                <div className="text-2xl font-black text-amber-300">{avgSystemScore}%</div>
                <div className="text-[11px] text-indigo-200 font-medium mt-0.5">Avg Performance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search faculty by name or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-800">{filteredFaculties.length}</span> of {facultiesList.length} faculty records
          </div>
        </div>

        {/* Main Analytics Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 w-16">#</th>
                  <th className="p-4">Faculty Name</th>
                  <th className="p-4">Employee ID</th>
                  <th className="p-4 text-center">Total Students</th>
                  <th className="p-4 text-center">Response Rate</th>
                  <th className="p-4 text-center">Overall Performance</th>
                  <th className="p-4 text-right pr-6">Assigned Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredFaculties.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500">
                      No faculty members found matching your search query.
                    </td>
                  </tr>
                ) : (
                  filteredFaculties.map((fac, idx) => {
                    const isExpanded = !!expandedIds[fac.facultyId];
                    const responseRatePct = fac.totalAssigned > 0 
                      ? Math.round((fac.submittedCount / fac.totalAssigned) * 100) 
                      : 0;

                    return (
                      <React.Fragment key={fac.facultyId}>
                        <tr 
                          onClick={() => toggleExpand(fac.facultyId)}
                          className={`cursor-pointer transition-colors hover:bg-indigo-50/40 ${isExpanded ? 'bg-indigo-50/60 font-semibold' : ''}`}
                        >
                          <td className="p-4 pl-6 font-medium text-gray-500">{idx + 1}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                                {fac.facultyName ? fac.facultyName.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{fac.facultyName}</div>
                                <div className="text-[11px] text-gray-400 font-normal">Active Educator</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-medium text-gray-600">
                            <span className="px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200/80 text-xs">
                              {fac.facultyId}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-gray-800">
                            {fac.totalAssigned}
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${responseRatePct}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">
                                {fac.submittedCount} ({responseRatePct}%)
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${getScoreBadge(fac.overallPercentage)}`}>
                              <Star size={13} className="fill-current" />
                              {fac.overallPercentage ? `${fac.overallPercentage}%` : 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(fac.facultyId);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-all shadow-2xs"
                            >
                              <span>{fac.assignedItems.length} {fac.assignedItems.length === 1 ? 'Class' : 'Classes'}</span>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Sub-Table Tray */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 border-t border-b border-indigo-100/80 shadow-inner">
                            <td colSpan={7} className="p-4 sm:p-6 pl-6 sm:pl-16">
                              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                  <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-indigo-600" />
                                    <h4 className="font-bold text-gray-900 text-sm">Assigned Subjects & Timetables Breakdown</h4>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">Click on any course to open full student feedback responses</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {fac.assignedItems.map((item) => {
                                    const cardPct = item.percentage;
                                    return (
                                      <div 
                                        key={item.id}
                                        onClick={() => handleDrilldown(fac, item)}
                                        className="group p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                                      >
                                        <div className="space-y-2.5">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
                                              <MapPin size={11} /> Room: {item.roomNo}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${getScoreBadge(cardPct)}`}>
                                              {cardPct ? `${cardPct}% Score` : 'No Score'}
                                            </span>
                                          </div>

                                          <div>
                                            <h5 className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors line-clamp-1" title={item.subjectName}>
                                              {item.subjectName}
                                            </h5>
                                            <div className="text-xs text-gray-500 font-mono font-medium mt-0.5">
                                              Code: <span className="text-gray-700 font-semibold">{item.subjectCode}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-200/70 flex items-center justify-between text-xs">
                                          <span className="text-gray-600 flex items-center gap-1 font-medium truncate" title={item.timetableName}>
                                            <Calendar size={13} className="text-gray-400 shrink-0" />
                                            {item.timetableName}
                                          </span>
                                          <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                                            View <ArrowRight size={13} />
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackFacultyAnalyticsPage;
