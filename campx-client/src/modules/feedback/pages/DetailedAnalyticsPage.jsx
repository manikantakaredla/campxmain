import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Star, BarChart3, ChevronRight, MessageSquare, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../../../services/api';

const TIMETABLES_CONFIG = {
  "T1 TIME TABLE": {
    columns: [
      { code: "241CS007", name: "Computer Networks" },
      { code: "241IT004", name: "Compiler Design" },
      { code: "241AI005", name: "Machine Learning" },
      { code: "241CS017", name: "Object Oriented Analysis & Design using UML" },
      { code: "241MB001", name: "Engineering Economics & Management" },
      { code: "241AI014", name: "Soft Computing -MI,CA (Minor Stream)" },
      { code: "241AI010", name: "Natural Language Processing - MI (Minor Stream)" }
    ],
    rows: [
      {
        class: "RB-306",
        faculties: [
          { id: "6893", name: "Alla Devi Prasanthi" },
          { id: "6079", name: "Dr. Appalaraju Grandhi" },
          { id: "6749", name: "Jyothula Vidya" },
          { id: "6749", name: "Jyothula Vidya" },
          { id: "5", name: "Dr. N. Visalakshi" },
          { id: "1852", name: "U P Kumar Chaturvedula" },
          { id: "391", name: "Dr. Tirukoti Sudha Rani" }
        ]
      },
      {
        class: "RB-307",
        faculties: [
          { id: "6123", name: "Chinnari Mrudula Pothula" },
          { id: "6722", name: "Kavitapu Nagasivasankara Varaprasad" },
          { id: "6807", name: "Dr. Sindhu B" },
          { id: "6231", name: "Ramesh Kothapalli" },
          { id: "4826", name: "Dr. K V Siva Mohan" },
          { id: "6699", name: "Dr. K V Siva Prasad Reddy" },
          { id: "6787", name: "Surimalli Koteswara Rao" }
        ]
      },
      {
        class: "RB-308",
        faculties: [
          { id: "6722", name: "Kavitapu Nagasivasankara Varaprasad" },
          { id: "6849", name: "Talluri Hari Babu" },
          { id: "6099", name: "Dr. Subba Rao Polamuri" },
          { id: "6908", name: "Mallidi Venkata Ajay Kumar Reddy" },
          { id: "411", name: "Mrs. V. Suneetha" },
          { id: "Rajendra Mahanta", name: "Rajendra Mahanta" },
          { id: "6849", name: "Talluri Hari Babu" }
        ]
      }
    ]
  },
  "T2 TIME TABLE": {
    columns: [
      { code: "241CS007", name: "Computer Networks" },
      { code: "241IT004", name: "Compiler Design" },
      { code: "241AI005", name: "Machine Learning" },
      { code: "241CS017", name: "Object Oriented Analysis & Design using UML" },
      { code: "241MB001", name: "Engineering Economics & Management" },
      { code: "241AI026", name: "Information Retrieval Systems -DE(Minor Stream)" },
      { code: "241CS034", name: "Fundamentals of Data Science -DE(Minor Stream)" }
    ],
    rows: [
      {
        class: "JWB-102",
        faculties: [
          { id: "6722", name: "Kavitapu Nagasivasankara Varaprasad" },
          { id: "6893", name: "Alla Devi Prasanthi" },
          { id: "1425", name: "M Kalyan Ram" },
          { id: "6908", name: "Mallidi Venkata Ajay Kumar Reddy" },
          { id: "5", name: "Dr. N. Visalakshi" },
          { id: "1425", name: "M Kalyan Ram" },
          { id: "1852", name: "U P Kumar Chaturvedula" }
        ]
      },
      {
        class: "JWB-103",
        faculties: [
          { id: "6791", name: "Koneti Durga Bhavani" },
          { id: "6355", name: "Dr. Jalaiah Saikam" },
          { id: "6749", name: "Jyothula Vidya" },
          { id: "6231", name: "Ramesh Kothapalli" },
          { id: "4711", name: "Dr. Elumalai P V" },
          { id: "5243", name: "Dr. Pennada Siva Satya Prasad" },
          { id: "6079", name: "Dr. Appalaraju Grandhi" }
        ]
      },
      {
        class: "JWB-104",
        faculties: [
          { id: "6893", name: "Alla Devi Prasanthi" },
          { id: "6722", name: "Kavitapu Nagasivasankara Varaprasad" },
          { id: "6099", name: "Dr. Subba Rao Polamuri" },
          { id: "6369", name: "Rananki Padma Sri" },
          { id: "411", name: "Mrs. V. Suneetha" },
          { id: "5317", name: "G Uma Mahesh" },
          { id: "6369", name: "Rananki Padma Sri" }
        ]
      }
    ]
  },
  "T3 TIME TABLE": {
    columns: [
      { code: "241CS007", name: "Computer Networks" },
      { code: "241IT004", name: "Compiler Design" },
      { code: "241AI005", name: "Machine Learning" },
      { code: "241CS017", name: "Object Oriented Analysis & Design using UML" },
      { code: "241MB001", name: "Engineering Economics & Management" },
      { code: "241CS030", name: "Information Security Analysis & Audit -NS (Minor Stream)" },
      { code: "241CS023", name: "Cloud Computing -NS (Minor Stream)" }
    ],
    rows: [
      {
        class: "JWB-107",
        faculties: [
          { id: "Anil Kumar Prathipati", name: "Anil Kumar Prathipati" },
          { id: "353", name: "Nalla Siva Kumar" },
          { id: "6099", name: "Dr. Subba Rao Polamuri" },
          { id: "6807", name: "Dr. Sindhu B" },
          { id: "5", name: "Dr. N. Visalakshi" },
          { id: "Rajendra Kumar Mahanta", name: "Rajendra Kumar Mahanta" },
          { id: "5317", name: "Gandhikota Umamahesh" }
        ]
      },
      {
        class: "JWB-108",
        faculties: [
          { id: "6123", name: "Chinnari Mrudula Pothula" },
          { id: "6355", name: "Dr. Jalaiah Saikam" },
          { id: "6807", name: "Dr. Sindhu B" },
          { id: "6355", name: "Dr. Jalaiah Saikam" },
          { id: "411", name: "Mrs. V. Suneetha" },
          { id: "6380", name: "Dr. Nagaraju Katta" },
          { id: "5243", name: "Dr. Pennada Siva Satya Prasad" }
        ]
      }
    ]
  },
  "T4 TIME TABLE": {
    columns: [
      { code: "241CS007", name: "Computer Networks" },
      { code: "241IT004", name: "Compiler Design" },
      { code: "241AI005", name: "Machine Learning" },
      { code: "241CS017", name: "Object Oriented Analysis & Design using UML" },
      { code: "241MB001", name: "Engineering Economics & Management" },
      { code: "241AI014", name: "Soft Computing -MI,CA (Minor Stream)" },
      { code: "241AI010", name: "Natural Language Processing - MI (Minor Stream)" }
    ],
    rows: [
      {
        class: "RB-304 & RB-305",
        faculties: [
          { id: "6791", name: "Koneti Durga Bhavani" },
          { id: "6079", name: "Dr. Appalaraju Grandhi" },
          { id: "6901", name: "Arasada Rakesh" },
          { id: "6231", name: "Ramesh Kothapalli" },
          { id: "5", name: "Dr. N. Visalakshi" },
          { id: "6699", name: "Dr. K V Siva Prasad Reddy" },
          { id: "391", name: "Dr. Tirukoti Sudha Rani" }
        ]
      }
    ]
  }
};

const DetailedAnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  
  const [studentResponses, setStudentResponses] = useState(null);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [exportingTimetable, setExportingTimetable] = useState(false);

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

  const fetchStudentResponses = async (ttName, fId, subject = null, courseCode = null) => {
    try {
      setResponsesLoading(true);
      let url = `/feedback/admin/analytics/faculty-students?timetable=${encodeURIComponent(ttName)}&facultyId=${encodeURIComponent(fId)}`;
      if (subject) {
        url += `&subject=${encodeURIComponent(subject)}`;
      }
      if (courseCode) {
        url += `&courseCode=${encodeURIComponent(courseCode)}`;
      }
      const res = await api.get(url);
      setStudentResponses(res.data);
    } catch (error) {
      toast.error('Failed to load student responses');
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleFacultyClick = (faculty, roomNo = null, subject = null, courseCode = null) => {
    setSelectedFaculty({ ...faculty, roomNo, subject, courseCode });
    fetchStudentResponses(selectedTimetable.name, faculty.facultyId, subject, courseCode);
  };

  const downloadPDF = () => {
    if (!studentResponses) return;
    
    const doc = new jsPDF('landscape');
    const marginL = 14;
    
    // 1. Overall Header Information
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FACULTY FEEDBACK REPORT", marginL, 15);
    
    doc.setFontSize(10);
    
    // Left column
    doc.setFont("helvetica", "bold");
    doc.text("EMP NAME:", marginL, 25);
    doc.setFont("helvetica", "normal");
    doc.text(selectedFaculty.facultyName, marginL + 25, 25);

    doc.setFont("helvetica", "bold");
    doc.text("EMP ID:", marginL, 31);
    doc.setFont("helvetica", "normal");
    doc.text(String(selectedFaculty.facultyId), marginL + 25, 31);

    doc.setFont("helvetica", "bold");
    doc.text("Time Table:", marginL, 37);
    doc.setFont("helvetica", "normal");
    doc.text(selectedTimetable.name, marginL + 25, 37);
    
    // Right column
    const rightColX = 140;
    doc.setFont("helvetica", "bold");
    doc.text("SUB:", rightColX, 25);
    doc.setFont("helvetica", "normal");
    doc.text(selectedFaculty.subject || 'N/A', rightColX + 25, 25);

    doc.setFont("helvetica", "bold");
    doc.text("ROOM NO:", rightColX, 31);
    doc.setFont("helvetica", "normal");
    doc.text(selectedFaculty.roomNo || 'N/A', rightColX + 25, 31);
    
    // Calculate Overall Percentage across all questions
    let totalPoor = 0, totalFair = 0, totalGood = 0, totalVeryGood = 0, totalExcellent = 0;
    let totalSum = 0, totalCount = 0;
    
    studentResponses.questions.forEach(q => {
       studentResponses.students.forEach(student => {
          const ans = student.answers[q._id];
          if (ans === 'Poor') { totalPoor++; totalSum += 1; totalCount++; }
          if (ans === 'Fair') { totalFair++; totalSum += 2; totalCount++; }
          if (ans === 'Good') { totalGood++; totalSum += 3; totalCount++; }
          if (ans === 'Very Good') { totalVeryGood++; totalSum += 4; totalCount++; }
          if (ans === 'Excellent') { totalExcellent++; totalSum += 5; totalCount++; }
       });
    });
    
    const overallPercentage = totalCount > 0 ? ((totalSum / totalCount) * 20) : 0;
    let grade = 'Poor';
    if (overallPercentage >= 80) grade = 'Excellent';
    else if (overallPercentage >= 60) grade = 'Good';
    else if (overallPercentage >= 40) grade = 'Average';
    
    doc.setFont("helvetica", "bold");
    doc.text("Overall Feedback Percentage:", rightColX, 37);
    doc.setFont("helvetica", "normal");
    doc.text(`${overallPercentage.toFixed(1)}% (${grade})`, rightColX + 53, 37);

    // 2. Stats Summary
    const totalStudents = studentResponses.students.length;
    const respondedCount = studentResponses.students.filter(s => s.status === 'Given').length;
    const pendingCount = totalStudents - respondedCount;
    
    doc.setFont("helvetica", "bold");
    doc.text("Summary Stats:", marginL, 47);
    doc.setFont("helvetica", "normal");
    doc.text(`TOTAL STUDENTS: ${totalStudents}`, marginL, 53);
    doc.text(`RESPONSES COUNT: ${respondedCount}`, marginL + 50, 53);
    doc.text(`PENDING COUNT: ${pendingCount}`, marginL + 110, 53);

    // 3. Detailed Question Stats Table
    doc.setFont("helvetica", "bold");
    doc.text("Stats & Counts by Questions:", marginL, 63);
    
    const qStatsHead = [["Question", "Excellent", "Very Good", "Good", "Fair", "Poor", "Overall %"]];
    const qStatsBody = [];
    studentResponses.questions.forEach((q, idx) => {
       let poor = 0, fair = 0, good = 0, veryGood = 0, excellent = 0;
       let sum = 0, count = 0;
       studentResponses.students.forEach(student => {
          const ans = student.answers[q._id];
          if (ans === 'Poor') { poor++; sum += 1; count++; }
          if (ans === 'Fair') { fair++; sum += 2; count++; }
          if (ans === 'Good') { good++; sum += 3; count++; }
          if (ans === 'Very Good') { veryGood++; sum += 4; count++; }
          if (ans === 'Excellent') { excellent++; sum += 5; count++; }
       });
       const pct = count > 0 ? ((sum / count) * 20).toFixed(1) + "%" : "N/A";
       qStatsBody.push([`Q${idx+1}: ${q.questionText}`, excellent, veryGood, good, fair, poor, pct]);
    });
    // Add total row
    qStatsBody.push(["Total Overall", totalExcellent, totalVeryGood, totalGood, totalFair, totalPoor, `${overallPercentage.toFixed(1)}%`]);

    autoTable(doc, {
      startY: 67,
      head: qStatsHead,
      body: qStatsBody,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
         0: { cellWidth: 130 }
      },
      margin: { left: marginL, right: 10 }
    });

    // 4. Student Responses Table
    let finalY = doc.lastAutoTable.finalY || 67;
    
    doc.setFont("helvetica", "bold");
    doc.text("Student Responses List:", marginL, finalY + 12);

    const tableColumn = ["S.No"];
    const questionKeys = studentResponses.questions.map(q => q._id);
    studentResponses.questions.forEach((q, idx) => {
      tableColumn.push(`Q${idx+1}`);
    });
    tableColumn.push("Suggestions");

    const tableRows = [];
    const respondedStudents = studentResponses.students.filter(s => s.status === 'Given');
    respondedStudents.forEach((student, index) => {
      const studentData = [
        index + 1
      ];
      questionKeys.forEach(qId => {
        studentData.push(student.answers[qId] || '-');
      });
      studentData.push(student.suggestions || '-');
      tableRows.push(studentData);
    });

    autoTable(doc, {
      startY: finalY + 16,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 15 }, // S.No
        [tableColumn.length - 1]: { cellWidth: 'auto' }
      },
      margin: { left: marginL, right: 10, bottom: 15 }
    });

    doc.save(`${selectedFaculty.facultyName.replace(/\s+/g, '_')}_Feedback.pdf`);
  };

  const downloadExcel = () => {
    if (!studentResponses) return;
    
    // Calculate stats
    const total = studentResponses.students.length;
    const submitted = studentResponses.students.filter(s => s.status === 'Given').length;
    const percent = total > 0 ? ((submitted / total) * 100).toFixed(1) : 0;
    const stats = studentResponses.stats;
    const statsText = `Stats: Poor (${stats['Poor']}) | Fair (${stats['Fair']}) | Good (${stats['Good']}) | Very Good (${stats['Very Good']}) | Excellent (${stats['Excellent']})`;

    // Prepare Sheet 1: Metadata + Table
    const sheet1Data = [
      [`Feedback Details - ${selectedFaculty.facultyName}`],
      [`Timetable: ${selectedTimetable.name} | Subject: ${selectedFaculty.subject || 'All'}`],
      [`Total Assigned: ${total} | Responded: ${submitted} | Response Rate: ${percent}%`],
      [statsText],
      [] // empty row before table
    ];

    const headers = ["S.No"];
    studentResponses.questions.forEach((q, idx) => {
      headers.push(`Q${idx+1}`);
    });
    headers.push("Suggestions");
    sheet1Data.push(headers);

    const respondedStudents = studentResponses.students.filter(s => s.status === 'Given');
    respondedStudents.forEach((student, index) => {
      const row = [index + 1];
      studentResponses.questions.forEach(q => {
        row.push(student.answers[q._id] || '-');
      });
      row.push(student.suggestions || '-');
      sheet1Data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheet1Data);
    
    // Generate Sheet 2: Detailed Stats
    const statsData = [
      { "Metric": "Employee Name", "Value": selectedFaculty.facultyName },
      { "Metric": "Employee ID", "Value": selectedFaculty.facultyId },
      { "Metric": "Subject", "Value": selectedFaculty.subject || 'All' },
      { "Metric": "Room No", "Value": selectedFaculty.roomNo || 'N/A' },
      { "Metric": "Total Students", "Value": total },
      { "Metric": "Responses Count", "Value": submitted }
    ];

    studentResponses.questions.forEach((q, idx) => {
      let poor = 0, fair = 0, good = 0, veryGood = 0, excellent = 0;
      studentResponses.students.forEach(student => {
        const ans = student.answers[q._id];
        if (ans === 'Poor') poor++;
        if (ans === 'Fair') fair++;
        if (ans === 'Good') good++;
        if (ans === 'Very Good') veryGood++;
        if (ans === 'Excellent') excellent++;
      });
      statsData.push({ 
        "Metric": `Q${idx+1} (${q.questionText})`, 
        "Value": `Excellent: ${excellent}, Very Good: ${veryGood}, Good: ${good}, Fair: ${fair}, Poor: ${poor}` 
      });
    });

    const ws2 = XLSX.utils.json_to_sheet(statsData, { header: ["Metric", "Value"] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback Responses");
    XLSX.utils.book_append_sheet(wb, ws2, "Feedback Stats");
    
    XLSX.writeFile(wb, `${selectedFaculty.facultyName.replace(/\s+/g, '_')}_Feedback.xlsx`);
  };

  const downloadTimetableExcel = async () => {
    if (!selectedTimetable || !selectedTimetable.faculties || selectedTimetable.faculties.length === 0) {
      toast.error('No faculties available in this timetable');
      return;
    }

    setExportingTimetable(true);
    const toastId = toast.loading('Generating Excel sheets for all faculties...');
    try {
      const ttPrefixMatch = selectedTimetable.name.match(/^T\d+/i);
      const ttPrefix = ttPrefixMatch ? ttPrefixMatch[0].toUpperCase() : null;
      let configKey = null;
      if (ttPrefix) {
        configKey = Object.keys(TIMETABLES_CONFIG).find(k => k.startsWith(ttPrefix));
      } else {
        configKey = Object.keys(TIMETABLES_CONFIG).find(k => 
          selectedTimetable.name.toLowerCase().includes(k.split(' ')[0].toLowerCase())
        );
      }
      const config = configKey ? TIMETABLES_CONFIG[configKey] : null;

      const tasks = [];
      selectedTimetable.faculties.forEach(fac => {
        const subjKeys = Object.keys(fac.subjects || {});
        if (subjKeys.length === 0) {
          tasks.push({ fac, subject: null, courseCode: null, label: 'General', roomNo: 'N/A' });
        } else {
          subjKeys.forEach(sKey => {
            let matchedCol = null;
            let matchedRoom = 'N/A';
            if (config) {
              if (config.columns) {
                matchedCol = config.columns.find(col => 
                  col.code.toLowerCase() === sKey.toLowerCase() || 
                  col.name.toLowerCase() === sKey.toLowerCase() ||
                  col.name.toLowerCase().includes(sKey.toLowerCase()) ||
                  sKey.toLowerCase().includes(col.name.toLowerCase())
                );
              }
              if (config.rows) {
                for (const row of config.rows) {
                  const facIdx = row.faculties.findIndex(f => f.id === String(fac.facultyId) || (f.name.toLowerCase().replace(/[^a-z0-9]/g, '') === fac.facultyName.toLowerCase().replace(/[^a-z0-9]/g, '')));
                  if (facIdx !== -1) {
                    const col = config.columns[facIdx];
                    if (col && (col.code.toLowerCase() === sKey.toLowerCase() || col.name.toLowerCase().includes(sKey.toLowerCase()) || sKey.toLowerCase().includes(col.name.toLowerCase()))) {
                      matchedRoom = row.class;
                      break;
                    } else if (matchedRoom === 'N/A') {
                      matchedRoom = row.class;
                    }
                  }
                }
              }
            }
            const isCourseCode = !sKey.includes(' ') && sKey.length <= 12 && /[0-9]/.test(sKey);
            const subjectParam = matchedCol ? matchedCol.name : (isCourseCode ? null : sKey);
            const courseCodeParam = matchedCol ? matchedCol.code : (isCourseCode ? sKey : null);
            const label = (matchedCol ? matchedCol.code : null) || (isCourseCode ? sKey : null) || (matchedCol ? matchedCol.name : sKey);
            
            tasks.push({ fac, subject: subjectParam, courseCode: courseCodeParam, label, roomNo: matchedRoom });
          });
        }
      });

      const results = await Promise.all(
        tasks.map(async (task) => {
          try {
            let url = `/feedback/admin/analytics/faculty-students?timetable=${encodeURIComponent(selectedTimetable.name)}&facultyId=${encodeURIComponent(task.fac.facultyId)}`;
            if (task.subject) url += `&subject=${encodeURIComponent(task.subject)}`;
            if (task.courseCode) url += `&courseCode=${encodeURIComponent(task.courseCode)}`;
            const res = await api.get(url);
            return { task, studentResp: res.data };
          } catch (err) {
            console.error(`Error loading data for ${task.fac.facultyName}:`, err);
            return null;
          }
        })
      );

      const wb = XLSX.utils.book_new();
      const usedSheetNames = new Set();

      results.forEach(resItem => {
        if (!resItem || !resItem.studentResp || !resItem.studentResp.students) return;
        const { task, studentResp } = resItem;

        const total = studentResp.students.length;
        const submitted = studentResp.students.filter(s => s.status === 'Given').length;
        const percent = total > 0 ? ((submitted / total) * 100).toFixed(1) : 0;
        const stats = studentResp.stats || {};
        const statsText = `Stats: Poor (${stats['Poor'] || 0}) | Fair (${stats['Fair'] || 0}) | Good (${stats['Good'] || 0}) | Very Good (${stats['Very Good'] || 0}) | Excellent (${stats['Excellent'] || 0})`;
        
        const subjectTitle = task.subject || task.courseCode || task.label || 'All';

        const sheetData = [
          [`Feedback Details - ${task.fac.facultyName}`],
          [`Timetable: ${selectedTimetable.name} | Subject: ${subjectTitle} | ID: ${task.fac.facultyId}`],
          [`Total Assigned: ${total} | Responded: ${submitted} | Response Rate: ${percent}%`],
          [statsText],
          []
        ];

        const headers = ["S.No"];
        const questionsList = studentResp.questions || [];
        questionsList.forEach((q, idx) => {
          headers.push(`Q${idx+1}`);
        });
        headers.push("Suggestions");
        sheetData.push(headers);

        const respondedStudents = studentResp.students.filter(s => s.status === 'Given');
        respondedStudents.forEach((student, index) => {
          const row = [index + 1];
          questionsList.forEach(q => {
            row.push(student.answers[q._id] || '-');
          });
          row.push(student.suggestions || '-');
          sheetData.push(row);
        });

        // Merging Feedback Stats (Metric & Value table) directly into the sheet
        sheetData.push([]);
        sheetData.push([]);
        sheetData.push(["Feedback Stats"]);
        sheetData.push(["Metric", "Value"]);
        sheetData.push(["Employee Name", task.fac.facultyName]);
        sheetData.push(["Employee ID", task.fac.facultyId]);
        sheetData.push(["Subject", subjectTitle]);
        sheetData.push(["Room No", task.roomNo || 'N/A']);
        sheetData.push(["Total Students", total]);
        sheetData.push(["Responses Count", submitted]);

        questionsList.forEach((q, idx) => {
          let poor = 0, fair = 0, good = 0, veryGood = 0, excellent = 0;
          studentResp.students.forEach(student => {
            const ans = student.answers[q._id];
            if (ans === 'Poor') poor++;
            if (ans === 'Fair') fair++;
            if (ans === 'Good') good++;
            if (ans === 'Very Good') veryGood++;
            if (ans === 'Excellent') excellent++;
          });
          sheetData.push([
            `Q${idx+1} (${q.questionText})`,
            `Excellent: ${excellent}, Very Good: ${veryGood}, Good: ${good}, Fair: ${fair}, Poor: ${poor}`
          ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // Format sheet name: "faculty name- subject name/code"
        const cleanName = (task.fac.facultyName || 'Faculty').replace(/[\\/?*:[\]]/g, '').trim();
        const cleanSubj = (task.label || 'Subj').replace(/[\\/?*:[\]]/g, '').trim();
        let candidateName = `${cleanName}-${cleanSubj}`;
        if (candidateName.length > 31) {
          const maxSubjLen = Math.min(cleanSubj.length, 12);
          const maxFacLen = Math.max(8, 31 - 1 - maxSubjLen);
          const truncFac = cleanName.substring(0, maxFacLen).trim();
          const truncSubj = cleanSubj.substring(0, 31 - 1 - truncFac.length).trim();
          candidateName = `${truncFac}-${truncSubj}`;
        }

        let finalSheetName = candidateName;
        let counter = 1;
        while (usedSheetNames.has(finalSheetName.toLowerCase())) {
          const suffix = `_${counter}`;
          finalSheetName = candidateName.substring(0, 31 - suffix.length) + suffix;
          counter++;
        }
        usedSheetNames.add(finalSheetName.toLowerCase());

        XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
      });

      if (wb.SheetNames.length === 0) {
        toast.error('No response data available to generate Excel.');
      } else {
        XLSX.writeFile(wb, `${selectedTimetable.name.replace(/\s+/g, '_')}_Consolidated_Report.xlsx`);
        toast.success('Excel report downloaded successfully!');
      }
    } catch (error) {
      console.error('Failed to generate timetable excel:', error);
      toast.error('Failed to generate Excel report');
    } finally {
      toast.dismiss(toastId);
      setExportingTimetable(false);
    }
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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedTimetable.name} - Faculties</h1>
              <p className="text-gray-500">Select a faculty to view specific ratings</p>
            </div>
          </div>
          <button 
            onClick={downloadTimetableExcel}
            disabled={exportingTimetable}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm shrink-0"
          >
            {exportingTimetable ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span>{exportingTimetable ? 'Generating Excel...' : 'Print Excel'}</span>
          </button>
        </div>

        {(() => {
          // Find matching config key based on timetable name prefix (e.g. 'T1', 'T2')
          const ttPrefixMatch = selectedTimetable.name.match(/^T\d+/i);
          const ttPrefix = ttPrefixMatch ? ttPrefixMatch[0].toUpperCase() : null;
          
          let configKey = null;
          if (ttPrefix) {
            configKey = Object.keys(TIMETABLES_CONFIG).find(k => k.startsWith(ttPrefix));
          } else {
            // fallback attempt if it doesn't start with T1, T2 etc
            configKey = Object.keys(TIMETABLES_CONFIG).find(k => 
              selectedTimetable.name.toLowerCase().includes(k.split(' ')[0].toLowerCase())
            );
          }

          const config = configKey ? TIMETABLES_CONFIG[configKey] : null;

          if (config) {
            const renderedFacultyIds = new Set();
            
            const tableUI = (
              <div className="mt-8 rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white overflow-x-auto">
                <table className="w-full text-center border-collapse bg-white">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-bold text-gray-700 border-r border-gray-200 align-middle w-24">Class</th>
                      {config.columns.map((col, idx) => (
                        <th key={idx} className="p-3 font-semibold text-gray-800 border-r border-gray-200 align-middle min-w-[140px] last:border-r-0">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{col.code}</div>
                          <div className="text-sm leading-tight">{col.name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {config.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 font-bold text-gray-800 border-r border-gray-200 whitespace-nowrap align-middle bg-gray-50/30">{row.class}</td>
                        {row.faculties.map((fac, cIdx) => {
                          const col = config.columns[cIdx];
                          const matchedFaculty = selectedTimetable.faculties.find(f => 
                            f.facultyId === fac.id || 
                            (f.facultyName.toLowerCase().replace(/[^a-z0-9]/g, '') === fac.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
                          );
                          let subjStats = null;
                          if (matchedFaculty) {
                            renderedFacultyIds.add(matchedFaculty.facultyId);
                            if (matchedFaculty.subjects) {
                              // Find matching subject by code or name
                              const matchedSubjKey = Object.keys(matchedFaculty.subjects).find(k => 
                                k.toLowerCase() === col.code.toLowerCase() || 
                                col.name.toLowerCase().includes(k.toLowerCase()) ||
                                k.toLowerCase().includes(col.name.toLowerCase())
                              );
                              if (matchedSubjKey) {
                                subjStats = matchedFaculty.subjects[matchedSubjKey];
                              }
                            }
                          }
                          
                          return (
                            <td 
                              key={cIdx} 
                              onClick={() => matchedFaculty && handleFacultyClick(matchedFaculty, row.class, col.name, col.code)}
                              className={`h-px p-0 border-r border-gray-200 last:border-r-0 align-top transition-all ${matchedFaculty ? 'cursor-pointer hover:bg-blue-50/60 hover:shadow-inner' : 'bg-gray-50/30'}`}
                            >
                              <div className="flex flex-col h-full min-h-[120px] justify-between">
                                <div className={`p-3 ${matchedFaculty ? '' : 'opacity-40'}`}>
                                  <div className="font-bold text-gray-900 text-sm">{fac.id !== fac.name ? fac.id : 'N/A'}</div>
                                  <div className="text-[11px] text-gray-500 mt-1 leading-tight line-clamp-2 uppercase tracking-wide font-medium" title={fac.name}>{fac.name}</div>
                                </div>
                                {subjStats ? (
                                  <div className="bg-indigo-50/80 p-2.5 border-t border-indigo-100 mt-auto flex flex-col items-center justify-center gap-1">
                                    <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shadow-sm">
                                      {subjStats.percentage ? `${subjStats.percentage}%` : 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-indigo-600/70 font-medium">
                                      {subjStats.submitted} / {subjStats.total} responses
                                    </div>
                                  </div>
                                ) : (
                                  matchedFaculty && (
                                    <div className="bg-gray-50 p-2.5 border-t border-gray-100 mt-auto flex items-center justify-center">
                                      <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-full">No data yet</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

            const unlistedFaculties = selectedTimetable.faculties.filter(f => !renderedFacultyIds.has(f.facultyId));

            return (
              <>
                {tableUI}
                {unlistedFaculties.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Star size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Additional Assigned Faculties</h2>
                        <p className="text-sm text-gray-500">These faculties are assigned to this timetable but aren't mapped in the main grid.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {unlistedFaculties.map((f, idx) => {
                        const subjKey = f.subjects ? Object.keys(f.subjects)[0] : null;
                        const subjStats = subjKey ? f.subjects[subjKey] : null;
                        
                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleFacultyClick(f, 'Other', subjKey || 'Unknown', subjKey || 'Unknown')}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <Users size={24} />
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium text-gray-500">Responses</span>
                                <p className="text-xl font-bold text-gray-900">{f.completionPercentage}%</p>
                                <p className="text-xs text-gray-400">{f.submitted} / {f.totalAssigned}</p>
                              </div>
                            </div>
                            
                            <h3 className="font-bold text-lg text-gray-900 truncate" title={f.facultyName}>{f.facultyName}</h3>
                            <p className="text-sm text-gray-500 font-medium mb-4">ID: {f.facultyId}</p>
                            
                            {subjStats && (
                              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-sm text-gray-600">Overall Rating for {subjKey}</span>
                                <span className="font-bold text-indigo-700">{subjStats.percentage}%</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          }

          // Fallback generic grid
          return (
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
          );
        })()}
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
            <p className="text-gray-500">
              Detailed Feedback for {selectedTimetable.name}
              {selectedFaculty.subject && (
                <>
                  <span className="mx-2">•</span>
                  Subject: {selectedFaculty.subject}
                </>
              )}
              <span className="mx-2">•</span>
              Employee ID: {selectedFaculty.facultyId}
              {selectedFaculty.roomNo && (
                <>
                  <span className="mx-2">•</span>
                  Room No: {selectedFaculty.roomNo}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-sm text-gray-500">Response Rate</p>
           {(() => {
             const actualTotal = studentResponses ? studentResponses.students.length : selectedFaculty.totalAssigned;
             const actualSubmitted = studentResponses ? studentResponses.students.filter(s => s.status === 'Given').length : selectedFaculty.submitted;
             const actualPercent = actualTotal > 0 ? ((actualSubmitted / actualTotal) * 100).toFixed(1) : 0;
             return <p className="text-lg font-bold text-gray-900">{actualSubmitted} / {actualTotal} ({actualPercent}%)</p>;
           })()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {questions.map((q, idx) => {
          let percentage = null;
          let score = null;
          if (studentResponses) {
            let sum = 0, count = 0;
            studentResponses.students.forEach(s => {
               const ratingStr = s.answers[q._id];
               let r = 0;
               if (ratingStr === 'Excellent') r = 5;
               else if (ratingStr === 'Very Good') r = 4;
               else if (ratingStr === 'Good') r = 3;
               else if (ratingStr === 'Fair') r = 2;
               else if (ratingStr === 'Poor') r = 1;
               
               if (r > 0) {
                 sum += r;
                 count++;
               }
            });
            if (count > 0) {
              score = (sum / count).toFixed(2);
              percentage = ((sum / count) * 20).toFixed(1);
            }
          } else {
            score = selectedFaculty.questionScores[q._id];
            percentage = selectedFaculty.questionPercentages ? selectedFaculty.questionPercentages[q._id] : (score ? (parseFloat(score) * 20).toFixed(1) : null);
          }

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
                <span className="text-3xl font-bold">{percentage ? `${percentage}%` : 'N/A'}</span>
                <span className="text-sm font-medium opacity-70">Score</span>
              </div>
            </div>
          );
        })}
      </div>

      {(() => {
        const suggestions = studentResponses 
          ? studentResponses.students.map(s => s.suggestions).filter(s => s && s.trim().length > 0)
          : selectedFaculty.suggestions;
        
        if (suggestions && suggestions.length > 0) {
          const positiveKeywords = ['good', 'nice', 'fine', 'great', 'excellent', 'best', 'super', 'awesome', 'satisfied', 'helpful', 'perfect', 'well', 'clear', 'love', 'liked'];
          const neutralKeywords = ['no', 'none', 'nothing', 'na', 'n/a', 'ok', 'okay', 'nil', 'no suggestions', 'no complaints', 'all good', 'as of now'];
          
          let positiveCount = 0;
          let neutralCount = 0;
          const actionableRemarks = [];

          suggestions.forEach(item => {
            const clean = item.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
            if (item.trim().length < 25) {
              const isNeutral = neutralKeywords.some(k => clean === k || clean.startsWith(k + ' ') || clean.endsWith(' ' + k));
              if (isNeutral || clean === 'no' || clean === 'nothing' || clean === 'no suggestions' || clean === 'na') {
                neutralCount++;
                return;
              }
              const isPositive = positiveKeywords.some(k => clean.includes(k));
              if (isPositive) {
                positiveCount++;
                return;
              }
            }
            actionableRemarks.push(item.trim());
          });

          const total = suggestions.length;
          const satisfactionPercent = Math.round(((positiveCount + neutralCount) / total) * 100) || 100;
          const uniqueRemarks = [...new Set(suggestions)];
          const sampleQuotes = uniqueRemarks.slice(0, 3).map(q => `"${q}"`).join(", ");
          
          let summaryPara = "";

          if (actionableRemarks.length === 0) {
            if (positiveCount > 0 && neutralCount > 0) {
              summaryPara = `Across all ${total} student remarks received, feedback indicates strong overall satisfaction and approval of the instructional approach. Students consistently expressed positive sentiments and general contentment (noting remarks such as ${sampleQuotes}), with no critical issues or structural modifications requested.`;
            } else if (positiveCount > 0) {
              summaryPara = `All ${total} submitted suggestions reflect overwhelmingly positive feedback and high general contentment with the teaching methodology and classroom engagement (featuring remarks such as ${sampleQuotes}). No specific areas of concern or course changes were requested by the students.`;
            } else {
              summaryPara = `A total of ${total} student comments were logged (e.g., ${sampleQuotes}), indicating general satisfaction with no specific methodological changes or complaints reported for the current course delivery.`;
            }
          } else {
            const sampleInsights = actionableRemarks.slice(0, 2).map(r => `"${r}"`).join(" and ");
            if (positiveCount + neutralCount > 0) {
              summaryPara = `Out of ${total} total suggestions received, the clear majority (${positiveCount + neutralCount} students, or ~${satisfactionPercent}%) expressed general approval or satisfaction without complaints. Meanwhile, ${actionableRemarks.length} student(s) provided specific descriptive feedback regarding course execution—highlighting points such as ${sampleInsights}${actionableRemarks.length > 2 ? ' among other notes' : ''}.`;
            } else {
              summaryPara = `Students submitted ${total} specific qualitative observations and suggestions regarding the course implementation and learning experience. Notable actionable feedback included remarks such as ${sampleInsights}${actionableRemarks.length > 2 ? ', alongside additional constructive comments detailed in the response table below.' : '.'}`;
            }
          }

          return (
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Student Suggestions Summary</h2>
                    <p className="text-xs text-gray-500">Consolidated executive overview of student remarks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100 flex items-center gap-1">
                    ✨ Executive Summary
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {suggestions.length} {suggestions.length === 1 ? 'Response' : 'Responses'}
                  </span>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 rounded-xl border border-indigo-100/80 shadow-inner">
                <p className="text-gray-800 text-sm md:text-base leading-relaxed font-normal">
                  {summaryPara}
                </p>
                <div className="mt-4 pt-3 border-t border-indigo-100/60 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className="font-semibold text-gray-700">Sentiment Breakdown:</span>
                  {positiveCount > 0 && (
                    <span className="bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-md border border-green-200">
                      👍 {positiveCount} Positive / Satisfied
                    </span>
                  )}
                  {neutralCount > 0 && (
                    <span className="bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-md border border-gray-200">
                      👌 {neutralCount} No Complaints / N/A
                    </span>
                  )}
                  {actionableRemarks.length > 0 && (
                    <span className="bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-md border border-amber-200">
                      💡 {actionableRemarks.length} Specific Note{actionableRemarks.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="sm:ml-auto text-gray-400 italic mt-1 sm:mt-0">Individual remarks shown in normal table below</span>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* STUDENT RESPONSES SECTION */}
      {responsesLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : studentResponses ? (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Student Responses List</h2>
          <div className="flex gap-2">
            <button 
              onClick={downloadExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <Download size={16} /> Excel
            </button>
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <Download size={16} /> PDF
            </button>
          </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map(rating => (
              <div key={rating} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-center">
                <p className="text-sm text-gray-500 mb-1">{rating}</p>
                <p className="text-2xl font-bold text-gray-900">{studentResponses.stats[rating]}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900">Detailed Question Stats</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="p-4 font-semibold text-gray-800 border-r border-gray-200">Question</th>
                    <th className="p-4 font-semibold text-gray-800 border-r border-gray-200 text-center">Excellent</th>
                    <th className="p-4 font-semibold text-gray-800 border-r border-gray-200 text-center">Very Good</th>
                    <th className="p-4 font-semibold text-gray-800 border-r border-gray-200 text-center">Good</th>
                    <th className="p-4 font-semibold text-gray-800 border-r border-gray-200 text-center">Fair</th>
                    <th className="p-4 font-semibold text-gray-800 border-r border-gray-200 text-center">Poor</th>
                    <th className="p-4 font-bold text-gray-900 text-center bg-gray-50/50">Overall %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(() => {
                    let totalPoor = 0, totalFair = 0, totalGood = 0, totalVeryGood = 0, totalExcellent = 0;
                    let totalSum = 0, totalCount = 0;
                    
                    const rows = studentResponses.questions.map((q, idx) => {
                      let poor = 0, fair = 0, good = 0, veryGood = 0, excellent = 0;
                      let sum = 0, count = 0;
                      studentResponses.students.forEach(student => {
                        const ans = student.answers[q._id];
                        if (ans === 'Poor') { poor++; sum += 1; count++; }
                        if (ans === 'Fair') { fair++; sum += 2; count++; }
                        if (ans === 'Good') { good++; sum += 3; count++; }
                        if (ans === 'Very Good') { veryGood++; sum += 4; count++; }
                        if (ans === 'Excellent') { excellent++; sum += 5; count++; }
                      });
                      
                      totalPoor += poor;
                      totalFair += fair;
                      totalGood += good;
                      totalVeryGood += veryGood;
                      totalExcellent += excellent;
                      totalSum += sum;
                      totalCount += count;
                      
                      const overallPercentage = count > 0 ? ((sum / count) * 20).toFixed(1) : 'N/A';
                      
                      return (
                        <tr key={q._id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900 border-r border-gray-200">Q{idx + 1}: {q.questionText}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-medium text-green-700">{excellent}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-medium text-blue-700">{veryGood}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-medium text-yellow-700">{good}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-medium text-orange-700">{fair}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-medium text-red-700">{poor}</td>
                          <td className="p-4 text-center font-bold text-indigo-700 bg-gray-50/50">{overallPercentage !== 'N/A' ? `${overallPercentage}%` : 'N/A'}</td>
                        </tr>
                      );
                    });
                    
                    const totalPercentage = totalCount > 0 ? ((totalSum / totalCount) * 20).toFixed(1) : 'N/A';
                    
                    return (
                      <>
                        {rows}
                        <tr className="bg-gray-100 border-t-2 border-gray-300">
                          <td className="p-4 font-bold text-gray-900 border-r border-gray-200 text-right">Total Overall</td>
                          <td className="p-4 text-center border-r border-gray-200 font-bold text-green-800">{totalExcellent}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-bold text-blue-800">{totalVeryGood}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-bold text-yellow-800">{totalGood}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-bold text-orange-800">{totalFair}</td>
                          <td className="p-4 text-center border-r border-gray-200 font-bold text-red-800">{totalPoor}</td>
                          <td className="p-4 text-center font-bold text-indigo-900 bg-indigo-50/80">{totalPercentage !== 'N/A' ? `${totalPercentage}%` : 'N/A'}</td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-200 w-16">S.No</th>
                  {studentResponses.questions.map((q, idx) => (
                    <th key={q._id} className="p-4 font-semibold text-gray-800 whitespace-nowrap border-r border-gray-200" title={q.questionText}>
                      Q{idx + 1}
                    </th>
                  ))}
                  <th className="p-4 font-semibold text-gray-800 whitespace-nowrap">Suggestions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentResponses.students.filter(s => s.status === 'Given').map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 border-r border-gray-200 text-center">{idx + 1}</td>
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
            {studentResponses.students.filter(s => s.status === 'Given').length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No feedback responses recorded for this faculty yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DetailedAnalyticsPage;
