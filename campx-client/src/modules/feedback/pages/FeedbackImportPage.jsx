import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Upload, AlertCircle, FileText, CheckCircle2, Download } from 'lucide-react';

const FeedbackImportPage = () => {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('append'); // replace, append
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Unsupported file format. Please upload Excel or CSV.');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        validateData(json);
      } catch (err) {
        toast.error('Error parsing file. Please ensure it is a valid Excel/CSV and UTF-8 encoded.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateData = (data) => {
    const newErrors = [];
    const validRows = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +1 for 0-index, +1 for header
      const rollNumber = row['Roll No'] || row['Roll Number'] || row['rollNumber'];
      const facultyName = row['Faculty Name'] || row['facultyName'];
      const courseCode = row['Course Code'] || row['courseCode'];
      const courseName = row['Course Name'] || row['courseName'];
      const timetable = row['Timetable'] || row['timetable'];
      const facultyId = row['Faculty ID'] || row['facultyId'] || ''; // optional

      if (!rollNumber) newErrors.push(`Row ${rowNum}: Missing Roll Number`);
      if (!facultyName) newErrors.push(`Row ${rowNum}: Missing Faculty Name`);
      if (!courseCode) newErrors.push(`Row ${rowNum}: Missing Course Code`);
      if (!courseName) newErrors.push(`Row ${rowNum}: Missing Course Name`);
      if (!timetable) newErrors.push(`Row ${rowNum}: Missing Timetable`);

      if (rollNumber && facultyName && courseCode && courseName && timetable) {
        validRows.push({
          rollNumber,
          facultyName,
          courseCode,
          courseName,
          timetable,
          facultyId
        });
      }
    });

    setErrors(newErrors);
    setPreview(validRows);
  };

  const handleImport = async () => {
    if (errors.length > 0) {
      if (!window.confirm(`There are ${errors.length} errors in your file. Invalid rows will be skipped. Do you want to continue?`)) {
        return;
      }
    }

    if (preview.length === 0) {
      toast.error('No valid data to import.');
      return;
    }

    setUploading(true);
    try {
      const res = await api.post('/feedback/admin/import', {
        rows: preview,
        importType,
        fileName: file.name
      });

      toast.success(res.data.message || 'Import successful!');
      setFile(null);
      setPreview([]);
      setErrors([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const headers = ['Roll No', 'Timetable', 'Course Code', 'Course Name', 'Faculty Name', 'Faculty ID'];
    const sampleRows = [
      ['24B11CS001', '4th Year Sec-A', 'CS401', 'Machine Learning', 'Dr. Smith', 'FAC001'],
      ['24B11CS002', '4th Year Sec-B', 'CS402', 'Cloud Computing', 'Prof. Johnson', 'FAC002']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "feedback_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Feedback Master Data</h1>
        <p className="text-gray-500">Upload Excel/CSV mapping students to faculty and courses.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Import Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="importType"
                    value="append"
                    checked={importType === 'append'}
                    onChange={(e) => setImportType(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Append/Update Records</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="importType"
                    value="replace"
                    checked={importType === 'replace'}
                    onChange={(e) => setImportType(e.target.value)}
                    className="text-red-600"
                  />
                  <span className="text-sm text-red-600">Replace All Data (Clear existing)</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 bg-white transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500 font-semibold">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">XLSX, XLS, or CSV (Max: 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                </label>
              </div>

              {file && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <FileText size={20} />
                  <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                  <button onClick={() => { setFile(null); setPreview([]); setErrors([]); }} className="text-sm hover:underline">Remove</button>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-3">Required Columns</h3>
                <ul className="text-sm text-gray-600 space-y-2 mb-4 list-disc list-inside">
                  <li><span className="font-medium text-gray-900">Roll No</span> (e.g., 24B11CS002)</li>
                  <li><span className="font-medium text-gray-900">Timetable</span> (e.g., 4th Year Sec-B)</li>
                  <li><span className="font-medium text-gray-900">Course Code</span></li>
                  <li><span className="font-medium text-gray-900">Course Name</span></li>
                  <li><span className="font-medium text-gray-900">Faculty Name</span></li>
                  <li><span className="font-medium text-gray-900">Faculty ID</span> (Optional)</li>
                </ul>
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mb-4">
                  <strong>Note:</strong> College emails are generated automatically from the Roll Number (e.g., 24b11cs002@adityauniversity.in).
                </div>
              </div>
              
              <button 
                onClick={downloadSampleTemplate}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors mt-auto"
              >
                <Download size={16} />
                Download Sample Template
              </button>
            </div>
          </div>
        </div>

        {/* Preview & Errors */}
        {file && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Data Preview</h3>
              <button
                onClick={handleImport}
                disabled={uploading || preview.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Importing...' : 'Start Import'}
              </button>
            </div>

            {errors.length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                <h4 className="flex items-center gap-2 text-sm font-bold text-red-800 mb-2">
                  <AlertCircle size={16} /> Validation Errors ({errors.length})
                </h4>
                <ul className="text-xs text-red-600 space-y-1">
                  {errors.slice(0, 50).map((err, i) => <li key={i}>{err}</li>)}
                  {errors.length > 50 && <li>...and {errors.length - 50} more errors</li>}
                </ul>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 text-xs uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Timetable</th>
                    <th className="p-3">Course Code</th>
                    <th className="p-3">Course Name</th>
                    <th className="p-3">Faculty Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{row.rollNumber}</td>
                      <td className="p-3">{row.timetable}</td>
                      <td className="p-3">{row.courseCode}</td>
                      <td className="p-3">{row.courseName}</td>
                      <td className="p-3">{row.facultyName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 10 && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Showing 10 of {preview.length} valid rows...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackImportPage;
