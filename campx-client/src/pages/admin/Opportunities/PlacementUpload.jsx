import React, { useState, useRef } from 'react';
import { uploadPlacements, downloadTemplate } from '../../../services/placementService';
import UploadSummary from '../../../components/opportunities/UploadSummary';
import toast from 'react-hot-toast';
import { UploadCloud, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';

const PlacementUpload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/)) {
      toast.error('Please upload a valid CSV or Excel file.');
      return;
    }
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await uploadPlacements(formData);
      setSummary(res.summary);
      toast.success('Upload processed!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Placement Records</h1>
        <p className="text-gray-600">Bulk import placement and internship records via CSV or Excel.</p>
      </div>

      {summary ? (
        <UploadSummary summary={summary} onReset={() => setSummary(null)} />
      ) : (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm animate-in fade-in duration-300">
          
          {/* Template Download Area */}
          <div className="flex flex-col md:flex-row items-start justify-between bg-blue-50 border border-blue-100 p-4 md:p-6 rounded-2xl md:rounded-xl mb-8 gap-4 md:gap-0">
            <div>
              <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                <FileSpreadsheet size={18} /> Format Guidelines
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Please ensure your file matches the required template structure. Required columns include: <br className="hidden md:block"/>
                <span className="font-mono bg-white px-2 py-1 rounded-lg text-blue-900 mt-2 inline-block shadow-sm">rollNumber, companyName, package, placementYear, offerType</span>
              </p>
            </div>
            <button 
              onClick={downloadTemplate}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-white text-blue-700 px-5 py-3 md:py-2 rounded-xl md:rounded-lg border border-blue-200 hover:bg-blue-100 font-medium shadow-sm transition-all"
            >
              <FileDown size={18} /> Download Template
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div 
            className={`border-2 border-dashed rounded-3xl md:rounded-xl p-8 md:p-12 text-center transition-colors cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".csv, .xlsx, .xls"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <FileSpreadsheet size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{file.name}</h3>
                <p className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Click or drag file to this area to upload</h3>
                <p className="text-gray-500 mb-4">Supports .csv and .xlsx formats up to 5MB</p>
                <span className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm pointer-events-none">
                  Select File
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg shadow-sm transition-all ${
                !file || isUploading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <><Loader2 size={20} className="animate-spin" /> Processing...</>
              ) : (
                <><UploadCloud size={20} /> Upload Records</>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default PlacementUpload;
