import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const UploadAssignments = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null) // Create a ref for file input
  const [uploadType, setUploadType] = useState('class')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const getConfig = () => {
    if (uploadType === 'class') {
      return {
        title: 'Upload Class Assignments',
        description: 'Assign class students to faculty members',
        endpoint: '/admin/upload/class-assignments',
        template: 'class_assignments_template.csv',
        columns: ['FacultyEmployeeID', 'RollNumber'],
        sample: 'FacultyEmployeeID,RollNumber\nFAC001,24B11CS052\nFAC001,24B11CS053'
      }
    } else {
      return {
        title: 'Upload Proctor Assignments',
        description: 'Assign proctor students to faculty members',
        endpoint: '/admin/upload/proctor-assignments',
        template: 'proctor_assignments_template.csv',
        columns: ['FacultyEmployeeID', 'RollNumber'],
        sample: 'FacultyEmployeeID,RollNumber\nFAC001,24B11CS052\nFAC002,24B11CS053'
      }
    }
  }

  const config = getConfig()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const isValid = file.name.endsWith('.csv') || file.name.endsWith('.xlsx')
      if (!isValid) {
        toast.error('Please upload CSV or Excel file')
        return
      }
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await api.post(config.endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setUploadResult(response.data)
      
      if (response.data.uploaded > 0) {
        toast.success(`✅ Successfully uploaded ${response.data.uploaded} assignments`)
      }
      if (response.data.failed > 0) {
        toast.error(`❌ ${response.data.failed} assignments failed - see errors below`)
      }
      
      setSelectedFile(null)
      // Reset file input using ref
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Upload failed')
      setUploadResult({ 
        success: false, 
        message: error.response?.data?.message,
        total: 0,
        uploaded: 0,
        failed: 1,
        errors: [{ row: 0, message: error.response?.data?.message || 'Upload failed' }]
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([config.sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = config.template
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }

  const clearResult = () => {
    setUploadResult(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-6 mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/management/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
          <p className="text-gray-500 mt-1">{config.description}</p>
        </div>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setUploadType('class'); setUploadResult(null); setSelectedFile(null) }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            uploadType === 'class'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Class Assignments
        </button>
        <button
          onClick={() => { setUploadType('proctor'); setUploadResult(null); setSelectedFile(null) }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            uploadType === 'proctor'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Proctor Assignments
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Upload File</h2>
              <p className="text-sm text-gray-500 mt-0.5">CSV or Excel format supported</p>
            </div>

            <div className="p-5">
              {/* File Upload Area */}
              {!selectedFile ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">CSV or Excel files only</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv,.xlsx"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Required Columns */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Required columns:</p>
                <div className="flex flex-wrap gap-2">
                  {config.columns.map((col, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-white border rounded-md font-mono">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upload Button */}
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload File
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              Download Template
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Download the CSV template and fill it with your data before uploading.
            </p>
            <button
              onClick={downloadTemplate}
              className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download {uploadType === 'class' ? 'Class' : 'Proctor'} Template
            </button>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Format Guidelines:</h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• First row must be column headers</li>
                <li>• FacultyEmployeeID must exist in system</li>
                <li>• RollNumber must exist in system</li>
                <li>• Each row is processed independently</li>
                <li>• Duplicates will be reported</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`p-4 ${uploadResult.uploaded > 0 ? 'bg-green-50' : 'bg-red-50'} border-b`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {uploadResult.uploaded > 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {uploadResult.uploaded > 0 ? 'Upload Complete' : 'Upload Failed'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Total: {uploadResult.total || 0} | 
                    Success: {uploadResult.uploaded || 0} | 
                    Failed: {uploadResult.failed || 0}
                  </p>
                </div>
              </div>
              <button onClick={clearResult} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error Details */}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Errors ({uploadResult.errors.length})
              </h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {uploadResult.errors.slice(0, 20).map((error, idx) => (
                  <div key={idx} className="text-xs text-red-600 p-2 bg-red-50 rounded">
                    Row {error.row}: {error.message}
                  </div>
                ))}
                {uploadResult.errors.length > 20 && (
                  <p className="text-xs text-gray-500 mt-2">
                    + {uploadResult.errors.length - 20} more errors
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UploadAssignments