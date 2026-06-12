import React from 'react';
import { CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';

const UploadSummary = ({ summary, onReset }) => {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-blue-600" />
          Upload Summary
        </h3>
        <button 
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Upload Another
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-blue-700">{summary.totalRecords}</span>
            <span className="text-sm font-medium text-blue-600 mt-1">Total Processed</span>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-green-700 flex items-center gap-2">
              <CheckCircle size={24} /> {summary.successRecords}
            </span>
            <span className="text-sm font-medium text-green-600 mt-1">Successfully Imported</span>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-red-700 flex items-center gap-2">
              <XCircle size={24} /> {summary.failedRecords}
            </span>
            <span className="text-sm font-medium text-red-600 mt-1">Failed Rows</span>
          </div>
        </div>

        {summary.errors && summary.errors.length > 0 && (
          <div>
            <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <XCircle size={18} /> Error Report ({summary.errors.length} issues)
            </h4>
            <div className="bg-red-50 rounded-lg border border-red-100 max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-red-200 text-sm text-left">
                <thead className="bg-red-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-red-800">Row</th>
                    <th className="px-4 py-2 font-semibold text-red-800">Roll Number</th>
                    <th className="px-4 py-2 font-semibold text-red-800">Error Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100 bg-white">
                  {summary.errors.map((err, idx) => (
                    <tr key={idx} className="hover:bg-red-50/50">
                      <td className="px-4 py-2 text-red-900 font-medium">{err.row}</td>
                      <td className="px-4 py-2 text-red-700">{err.rollNumber || 'N/A'}</td>
                      <td className="px-4 py-2 text-red-600">{err.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button 
              className="mt-4 flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900 bg-red-100 px-4 py-2 rounded-lg"
              onClick={() => {
                // Generate CSV from errors array
                const csvContent = "data:text/csv;charset=utf-8," 
                  + "Row,Roll Number,Error\n"
                  + summary.errors.map(e => `${e.row},${e.rollNumber || ''},"${e.error.replace(/"/g, '""')}"`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "upload_errors.csv");
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
            >
              <FileSpreadsheet size={16} />
              Download Error CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSummary;
