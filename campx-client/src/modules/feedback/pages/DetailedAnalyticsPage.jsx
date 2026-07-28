import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Star, BarChart3, ChevronRight, MessageSquare, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../../services/api';

const DetailedAnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  
  const [studentResponses, setStudentResponses] = useState(null);
  const [responsesLoading, setResponsesLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/feedback/admin/analytics/detailed');
      setData(res.data.timetables || []);
      setQuestions(res.data.questions || []);
    } catch (error) {
      toast.error('Failed to load detailed analytics');
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (rating) => {
    if (!rating) return 'bg-gray-100 text-gray-400 border-gray-200';
    const num = parseFloat(rating);
    if (num >= 4.5) return 'bg-green-50 text-green-700 border-green-200';
    if (num >= 3.5) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (num >= 2.5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const handleBack = () => {
    if (selectedFaculty) {
      setSelectedFaculty(null);
      setStudentResponses(null);
    } else if (selectedTimetable) {
      setSelectedTimetable(null);
    } else {
      navigate('/admin/feedback/dashboard');
    }
  };

  const fetchStudentResponses = async (ttName, fId) => {
    try {
      setResponsesLoading(true);
      const res = await api.get(`/feedback/admin/analytics/faculty-students?timetable=${encodeURIComponent(ttName)}&facultyId=${encodeURIComponent(fId)}`);
      setStudentResponses(res.data);
    } catch (error) {
      toast.error('Failed to load student responses');
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleFacultyClick = (faculty) => {
    setSelectedFaculty(faculty);
    fetchStudentResponses(selectedTimetable.name, faculty.facultyId);
  };

  const downloadPDF = () => {
    if (!studentResponses) return;
    
    const doc = new jsPDF('landscape');
    
    // Title
    doc.setFontSize(16);
    doc.text(`Feedback Details - ${selectedFaculty.facultyName}`, 14, 15);
    doc.setFontSize(12);
    doc.text(`Timetable: ${selectedTimetable.name}`, 14, 22);
    
    // Stats
    const stats = studentResponses.stats;
    doc.setFontSize(10);
    doc.text(`Stats: Poor (${stats['Poor']}) | Fair (${stats['Fair']}) | Good (${stats['Good']}) | Very Good (${stats['Very Good']}) | Excellent (${stats['Excellent']})`, 14, 30);
    
    // Prepare table data
    const tableColumn = ["Roll Number", "Status"];
    const questionKeys = studentResponses.questions.map(q => q._id);
    studentResponses.questions.forEach((q, idx) => {
      tableColumn.push(`Q${idx+1}`);
    });
    tableColumn.push("Suggestions");

    const tableRows = [];
    studentResponses.students.forEach(student => {
      const studentData = [
        student.rollNumber,
        student.status
      ];
      questionKeys.forEach(qId => {
        studentData.push(student.answers[qId] || '-');
      });
      studentData.push(student.suggestions || '-');
      tableRows.push(studentData);
    });

    doc.autoTable({
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] } // Indigo 600
    });

    doc.save(`${selectedFaculty.facultyName.replace(/\s+/g, '_')}_Feedback.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- VIEW 1: TIMETABLES ---
  if (!selectedTimetable) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timetable Analytics</h1>
            <p className="text-gray-500">Select a timetable to view faculty performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {data.map((tt, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedTimetable(tt)}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <BookOpen size={24} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-500">Completed</span>
                  <p className="text-xl font-bold text-indigo-600">{tt.completionPercentage}%</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate" title={tt.name}>{tt.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} />
                <span>{tt.submittedStudents} / {tt.totalStudents} Students</span>
              </div>
              
              <div className="mt-6 w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all" 
                  style={{ width: `${tt.completionPercentage}%` }}
                />
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No timetable data available.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 2: FACULTIES ---
  if (!selectedFaculty) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <button onClick={() => setSelectedTimetable(null)} className="hover:text-indigo-600 transition-colors">Timetables</button>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">{selectedTimetable.name}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedTimetable.name} - Faculties</h1>
            <p className="text-gray-500">Select a faculty to view specific ratings</p>
          </div>
        </div>

        {selectedTimetable.name.toLowerCase() === 'data engineering' ? (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-800 border-r border-gray-200">Class</th>
                  <th className="p-4 font-semibold text-gray-800 border-r border-gray-200">Computer Networks</th>
                  <th className="p-4 font-semibold text-gray-800 border-r border-gray-200">Compiler Design</th>
                  <th className="p-4 font-semibold text-gray-800 border-r border-gray-200">Machine Learning</th>
                  <th className="p-4 font-semibold text-gray-800 border-r border-gray-200">OOAD</th>
                  <th className="p-4 font-semibold text-gray-800 border-r border-gray-200">Engineering Economics & Management</th>
                  <th className="p-4 font-semibold text-gray-800 border-r border-gray-200">Information Retrieval Systems</th>
                  <th className="p-4 font-semibold text-gray-800">Fundamentals of Data Science</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    class: 'JWB-102',
                    cn: 'Kavitapu Nagasivasankara Varaprasad',
                    cd: 'Alla Devi Prasanthi',
                    ml: 'M Kalyan Ram',
                    ooad: 'Mallidi.Venkata Ajay Kumar Reddy',
                    eem: 'Dr. N.Visalakshi',
                    irs: 'M Kalyan Ram',
                    fds: 'U P Kumar Chaturvedula'
                  },
                  {
                    class: 'JWB-103',
                    cn: 'Koneti Durga Bhavani',
                    cd: 'Dr.Jalaiah Saikam',
                    ml: 'Jyothula Vidya',
                    ooad: 'Ramesh Kothapalli',
                    eem: 'Dr.Elumalai P V',
                    irs: 'Dr. Pennada Siva Satya Prasad',
                    fds: 'Dr. Appalaraju Grandhi'
                  },
                  {
                    class: 'JWB-104',
                    cn: 'Alla Devi Prasanthi',
                    cd: 'Kavitapu Nagasivasankara Varaprasad',
                    ml: 'Dr. Subba Rao Polamuri',
                    ooad: 'Rananki Padma Sri',
                    eem: 'Mr. V Suneetha',
                    irs: 'G Uma Mahesh',
                    fds: 'R Padma Sri'
                  }
                ].map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-gray-200 hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap">{row.class}</td>
                    {[row.cn, row.cd, row.ml, row.ooad, row.eem, row.irs, row.fds].map((fname, cIdx) => {
                      const matchedFaculty = selectedTimetable.faculties.find(f => 
                        f.facultyName.toLowerCase().replace(/[^a-z0-9]/g, '') === fname.toLowerCase().replace(/[^a-z0-9]/g, '')
                      ) || selectedTimetable.faculties.find(f => f.facultyName.toLowerCase().includes(fname.toLowerCase().split(' ')[0]));
                      
                      return (
                        <td 
                          key={cIdx} 
                          onClick={() => matchedFaculty && handleFacultyClick(matchedFaculty)}
                          className={`p-4 border-r border-gray-200 ${matchedFaculty ? 'cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors' : 'text-gray-500'}`}
                        >
                          {fname}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {selectedTimetable.faculties.map((f, idx) => (
              <div 
                key={idx} 
                onClick={() => handleFacultyClick(f)}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
              >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Users size={24} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-500">Responses</span>
                  <p className="text-xl font-bold text-gray-900">{f.completionPercentage}%</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={f.facultyName}>{f.facultyName}</h3>
              <p className="text-sm text-gray-500 mb-4 truncate">ID: {f.facultyId}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart3 size={16} />
                <span>{f.submitted} / {f.totalAssigned} Students</span>
              </div>
              
              <div className="mt-6 w-full bg-gray-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${parseFloat(f.completionPercentage) > 75 ? 'bg-green-500' : parseFloat(f.completionPercentage) > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${f.completionPercentage}%` }}
                />
              </div>
            </div>
          ))}
          {selectedTimetable.faculties.length === 0 && (
            <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500">No faculties assigned to this timetable.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 3: RATINGS ---
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 overflow-x-auto whitespace-nowrap pb-2">
        <button onClick={() => { setSelectedTimetable(null); setSelectedFaculty(null); }} className="hover:text-indigo-600 transition-colors">Timetables</button>
        <ChevronRight size={14} className="shrink-0" />
        <button onClick={() => setSelectedFaculty(null)} className="hover:text-indigo-600 transition-colors truncate max-w-[200px]">{selectedTimetable.name}</button>
        <ChevronRight size={14} className="shrink-0" />
        <span className="text-gray-900 font-medium truncate">{selectedFaculty.facultyName}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedFaculty.facultyName}</h1>
            <p className="text-gray-500">Detailed Feedback for {selectedTimetable.name}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-sm text-gray-500">Response Rate</p>
           <p className="text-lg font-bold text-gray-900">{selectedFaculty.submitted} / {selectedFaculty.totalAssigned} ({selectedFaculty.completionPercentage}%)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {questions.map((q, idx) => {
          const score = selectedFaculty.questionScores[q._id];
          return (
            <div key={q._id} className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col justify-between ${getHeatmapColor(score)}`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded-md shadow-sm opacity-70">Q{idx + 1}</span>
                  <Star size={18} className="opacity-70" />
                </div>
                <h3 className="font-medium text-sm line-clamp-3 mb-4" title={q.questionText}>{q.questionText}</h3>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <span className="text-3xl font-bold">{score || 'N/A'}</span>
                <span className="text-sm font-medium opacity-70">/ 5.0</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedFaculty.suggestions && selectedFaculty.suggestions.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Student Suggestions</h2>
            <span className="ml-auto bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
              {selectedFaculty.suggestions.length}
            </span>
          </div>
          <div className="space-y-4">
            {selectedFaculty.suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 text-sm">
                "{suggestion}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT RESPONSES SECTION */}
      {responsesLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : studentResponses ? (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Student Responses List</h2>
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map(rating => (
              <div key={rating} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-center">
                <p className="text-sm text-gray-500 mb-1">{rating}</p>
                <p className="text-2xl font-bold text-gray-900">{studentResponses.stats[rating]}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-200">Roll Number</th>
                  <th className="p-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-200">Status</th>
                  {studentResponses.questions.map((q, idx) => (
                    <th key={q._id} className="p-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-200" title={q.questionText}>
                      Q{idx + 1}
                    </th>
                  ))}
                  <th className="p-4 font-semibold text-gray-800 whitespace-nowrap">Suggestions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentResponses.students.map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 border-r border-gray-200">{student.rollNumber}</td>
                    <td className="p-4 border-r border-gray-200">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${student.status === 'Given' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {student.status}
                      </span>
                    </td>
                    {studentResponses.questions.map(q => (
                      <td key={q._id} className="p-4 text-sm text-gray-600 border-r border-gray-200">
                        {student.answers[q._id] || '-'}
                      </td>
                    ))}
                    <td className="p-4 text-sm text-gray-600 min-w-[200px]">
                      {student.suggestions || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {studentResponses.students.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No students assigned to this faculty for this timetable.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DetailedAnalyticsPage;
