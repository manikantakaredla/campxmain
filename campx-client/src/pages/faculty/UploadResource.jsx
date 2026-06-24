import React, { useState, useEffect } from 'react'
import { authService } from '../../services/authService'
import { useSettings } from '../../hooks/useSettings'
import { useNavigate, useLocation } from 'react-router-dom'
import { resourceService } from '../../services/resourceService'
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const UploadResource = () => {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('active')
  const user = authService.getStoredUser();
  const isAdminOrHigher = user && ['admin', 'management', 'principal', 'dean'].includes(user.role);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Notes',
    resourceType: 'Notes',
    subjectId: '',
    unitNumber: '',
    visibility: 'branch',
    targetBranch: '',
    targetYear: '',
    targetSection: '',
    file: null
  })
  const [filePreview, setFilePreview] = useState(null)
  const [assignedSubjects, setAssignedSubjects] = useState([])
  const [fetchingSubjects, setFetchingSubjects] = useState(true)

  const resourceTypes = [
    'Notes', 'PPT', 'Assignment', 'Question Bank', 'Previous Paper', 'Lab Manual', 'Syllabus', 'Video Link', 'Other'
  ]

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await resourceService.getFacultySubjects()
        if (res.success) {
          const allAssigned = [
            ...(res.primary || []).map(s => ({ ...s, isPrimary: true })),
            ...(res.secondary || []).map(s => ({ ...s, isPrimary: false }))
          ]
          setAssignedSubjects(allAssigned)
        }
      } catch (error) {
        console.error('Failed to fetch subjects', error)
        toast.error('Failed to load assigned subjects')
      } finally {
        setFetchingSubjects(false)
      }
    }
    fetchSubjects()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const subId = params.get('subjectId')
    if (subId) {
      setFormData(prev => ({ ...prev, subjectId: subId }))
    }
  }, [location.search])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB')
        return
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg', 'image/jpg', 'image/png'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Allowed: PDF, PPT, DOC, XLS, Images')
        return
      }
      
      setFormData({ ...formData, file })
      setFilePreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title) {
      toast.error('Please enter a title')
      return
    }

    if (formData.resourceType === 'Notes' && !formData.subjectId) {
      toast.error('Please select a subject for Notes')
      return
    }

    if (!formData.resourceType) {
      toast.error('Please select a resource type')
      return
    }
    
    if (!formData.file) {
      toast.error('Please select a file to upload')
      return
    }
    
    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.resourceType)
      submitData.append('resourceType', formData.resourceType)
      submitData.append('subjectId', formData.subjectId)
      if (formData.unitNumber) {
        submitData.append('unitNumber', formData.unitNumber)
      }
      submitData.append('visibility', formData.visibility)
      submitData.append('targetBranch', formData.targetBranch)
      submitData.append('targetYear', formData.targetYear)
      submitData.append('targetSection', formData.targetSection)
      submitData.append('status', submitStatus)
      submitData.append('file', formData.file)
      
      const response = await resourceService.create(submitData)
      
      if (response.success) {
        toast.success(submitStatus === 'draft' ? 'Saved as draft!' : 'Resource published successfully!')
        navigate(-1)
      } else {
        toast.error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload resource')
    } finally {
      setLoading(false)
    }
  }

  const removeFile = () => {
    setFormData({ ...formData, file: null })
    setFilePreview(null)
  }

  const getFileIcon = () => {
    if (!filePreview) return <FileText className="w-12 h-12 text-gray-400" />
    const type = filePreview.type
    if (type.includes('pdf')) return '📄'
    if (type.includes('powerpoint')) return '📊'
    if (type.includes('word')) return '📝'
    if (type.includes('excel')) return '📈'
    if (type.includes('image')) return '🖼️'
    return '📁'
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upload Resource</h1>
        <p className="text-gray-500 mt-1">Share study materials, notes, and resources with students</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Data Structures and Algorithms Notes"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the resource..."
            />
          </div>

          {/* Subject Selector */}
          {formData.resourceType === 'Notes' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            {fetchingSubjects ? (
              <div className="text-sm text-gray-500 animate-pulse">Loading assigned subjects...</div>
            ) : (
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Select Subject --</option>
                {assignedSubjects.map(sub => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({sub.code}) - {sub.department} [Sem {sub.semester}] {sub.isPrimary ? '(Primary)' : '(Secondary)'}
                  </option>
                ))}
              </select>
            )}
          </div>
          )}

          {/* Resource Type & Unit Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type <span className="text-red-500">*</span>
              </label>
              <select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {resourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Number (Optional)
              </label>
              <input
                type="number"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleInputChange}
                min="1"
                max="12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1, 2"
              />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="branch">Branch Only</option>
              <option value="all">All Students</option>
              <option value="year">Specific Year Only</option>
            </select>
          </div>

          {/* Conditional Fields */}
          {formData.visibility === 'branch' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Branch
              </label>
              <input
                type="text"
                name="targetBranch"
                value={formData.targetBranch}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CSE, ECE, Mechanical"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Only students from this branch can view</p>
            </div>
          )}

          {formData.visibility === 'year' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Year
              </label>
              <select
                name="targetYear"
                value={formData.targetYear}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File <span className="text-red-500">*</span>
            </label>
            
            {!filePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all cursor-pointer"
                onClick={() => document.getElementById('file-input').click()}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, PPT, DOC, XLS, Images (Max 50MB)
                </p>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getFileIcon()}</div>
                    <div>
                      <p className="font-medium text-gray-800">{filePreview.name}</p>
                      <p className="text-xs text-gray-400">{filePreview.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Resource Guidelines:</p>
              <ul className="list-disc list-inside mt-1 text-xs text-blue-700 space-y-0.5">
                <li>Maximum file size: 50MB</li>
                <li>Allowed formats: PDF, PPT, DOC, XLS, Images</li>
                <li>Make sure you have rights to share this content</li>
                <li>Resources are visible to students based on visibility settings</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => setSubmitStatus('draft')}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              onClick={() => setSubmitStatus('active')}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadResource