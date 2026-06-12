import React, { useState, useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { useAuth } from '../../hooks/useAuth'
import { resourceService } from '../../services/resourceService'
import { SearchBar } from '../../components/Common/SearchBar'
import { Pagination } from '../../components/Common/Pagination'
import { Loader } from '../../components/Common/Loader'
import { EmptyState } from '../../components/Common/EmptyState'
import { FileText, Plus, Edit, Trash2, Eye, Download, X, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'

const MyResources = () => {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const { settings } = useSettings()
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Notes',
    visibility: 'all',
    targetBranch: '',
    targetYear: '',
    targetSection: '',
    file: null
  })

  useEffect(() => {
    fetchResources()
  }, [pagination.page, searchTerm])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await resourceService.getAll({ 
        page: pagination.page, 
        limit: pagination.limit,
        search: searchTerm 
      })
      setResources(response.resources || [])
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }))
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.delete(id)
        toast.success('Resource deleted')
        fetchResources()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] })
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.file) {
      toast.error('Please fill in title and select a file')
      return
    }
    
    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('visibility', formData.visibility)
      submitData.append('targetBranch', formData.targetBranch)
      submitData.append('targetYear', formData.targetYear)
      submitData.append('targetSection', formData.targetSection)
      submitData.append('file', formData.file)
      
      await api.post('/resources', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Resource uploaded successfully')
      setShowUploadModal(false)
      setFormData({
        title: '',
        description: '',
        category: 'Notes',
        visibility: 'all',
        targetBranch: '',
        targetYear: '',
    targetSection: '',
        file: null
      })
      fetchResources()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resource')
    } finally {
      setSubmitting(false)
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('powerpoint')) return '📊'
    if (fileType?.includes('word')) return '📝'
    if (fileType?.includes('excel')) return '📈'
    if (fileType?.includes('image')) return '🖼️'
    return '📁'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Resources</h1>
          <p className="text-gray-500 mt-1">Upload and manage study materials</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload Resource
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <SearchBar onSearch={setSearchTerm} placeholder="Search your resources..." />
      </div>

      {/* Resources Grid */}
      {loading ? (
        <Loader />
      ) : resources.length === 0 ? (
        <EmptyState 
          icon={<FileText className="w-12 h-12" />}
          title="No resources yet"
          description="Upload your first resource to share with students"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{getFileIcon(resource.fileType)}</div>
                  <div className="flex gap-1">
                    <Link to={`/resource/${resource._id}`} className="p-1.5 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Only show Edit/Delete if user uploaded it */}
                    {(resource.uploadedBy === user?._id || resource.uploadedBy?._id === user?._id) && (
                      <>
                        <Link 
                          to={`/faculty/resources/edit/${resource._id}`} 
                          className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(resource._id)} className="p-1.5 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{resource.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {resource.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6">
          <Pagination 
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowUploadModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Upload Resource</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Data Structures Notes"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Brief description of the resource"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="input-field">
                    <option value="Notes">Notes</option>
                    <option value="PPT">PPT</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Lab">Lab Manual</option>
                    <option value="Question Bank">Question Bank</option>
                    <option value="Previous Papers">Previous Papers</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="input-field">
                    <option value="all">All Students</option>
                    <option value="branch">Specific Branch</option>
                    <option value="year">Specific Year</option>
                    <option value="section">Specific Section</option>
                    <option value="class">My Class Students</option>
                    <option value="proctor">My Proctor Students</option>
                  </select>
                </div>
              </div>
              
              {formData.visibility === 'branch' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Branch</label>
                  <select name="targetBranch" value={formData.targetBranch} onChange={handleInputChange} className="input-field">
                    <option value="">Select Branch</option>
                    {settings?.branches?.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
              
              {formData.visibility === 'year' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                  <select name="targetYear" value={formData.targetYear} onChange={handleInputChange} className="input-field">
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              )}
              {formData.visibility === 'section' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Section</label>
                  <select name="targetSection" value={formData.targetSection} onChange={handleInputChange} className="input-field">
                    <option value="">Select Section</option>
                    {settings?.sections?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.png"
                  className="input-field pt-1.5"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">PDF, PPT, DOC, XLS, Images (Max 50MB)</p>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default MyResources