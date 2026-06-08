import React, { useState, useEffect } from 'react'
import { History, FileText, CheckCircle, XCircle, Eye, Download } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

const UploadLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/upload-logs')
      setLogs(response.data.logs || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to load upload logs')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'students': return '👨‍🎓'
      case 'faculty': return '👨‍🏫'
      case 'class_assignments': return '📚'
      case 'proctor_assignments': return '👥'
      default: return '📄'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'students': return 'Students'
      case 'faculty': return 'Faculty'
      case 'class_assignments': return 'Class Assignments'
      case 'proctor_assignments': return 'Proctor Assignments'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upload Logs</h1>
        <p className="text-gray-500 mt-1">View history of all data uploads</p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No upload logs found</h3>
          <p className="text-gray-400 mt-1">Upload data to see logs here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 flex items-center justify-between flex-wrap gap-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getTypeIcon(log.type)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{getTypeLabel(log.type)}</h3>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total: <span className="font-medium">{log.totalRows}</span></p>
                    <p className="text-sm text-green-600">Success: {log.successRows}</p>
                    <p className="text-sm text-red-600">Failed: {log.failedRows}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLog(selectedLog?._id === log._id ? null : log)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {selectedLog?._id === log._id ? 'Hide Errors' : 'Show Errors'}
                  </button>
                </div>
              </div>
              
              {selectedLog?._id === log._id && log.errors && log.errors.length > 0 && (
                <div className="p-4 bg-red-50">
                  <h4 className="text-sm font-medium text-red-700 mb-2">Errors ({log.errors.length})</h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {log.errors.map((error, idx) => (
                      <div key={idx} className="text-xs text-red-600 p-2 bg-white rounded">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

