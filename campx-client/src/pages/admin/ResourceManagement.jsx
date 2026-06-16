import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, Eye, Trash2, Search, Download, 
  ChevronLeft, ChevronRight, AlertCircle,
  Image, File, FileSpreadsheet, FileArchive, EyeOff, UploadCloud
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const ResourceManagement = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const itemsPerPage = 12

  const categories = ['All', 'Notes', 'PPT', 'Assignment', 'Lab', 'Question Bank', 'Previous Papers', 'Other']

  useEffect(() => {
    fetchResources()
  }, [currentPage, searchTerm, categoryFilter])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: categoryFilter === 'All' ? '' : categoryFilter
      }
      const response = await api.get('/resources', { params })
      setResources(response.data.resources || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resources/${id}`)
      toast.success('Resource deleted successfully')
      setShowDeleteModal(null)
      fetchResources()
    } catch (error) {
      toast.error('Failed to delete resource')
    }
  }

  const handleToggleStatus = async (resource) => {
    const newStatus = resource.status === 'active' ? 'draft' : 'active'
    if (newStatus === 'draft' && !window.confirm('Are you sure you want to unpublish this resource?')) return
    if (newStatus === 'active' && !window.confirm('Are you sure you want to publish this resource? Students will be notified.')) return
    
    try {
      await api.put(`/resources/${resource._id}`, {
        title: resource.title,
        description: resource.description,
        category: resource.category,
        visibility: resource.visibility,
        targetBranch: resource.targetBranch,
        targetYear: resource.targetYear,
        targetSection: resource.targetSection,
        status: newStatus
      })
      toast.success(newStatus === 'active' ? 'Resource published' : 'Resource unpublished')
      fetchResources()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getFileIcon = (fileType, category) => {
    if (fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (fileType?.includes('powerpoint')) return <FileText className="w-5 h-5 text-orange-500" />
    if (fileType?.includes('word')) return <FileText className="w-5 h-5 text-blue-500" />
    if (fileType?.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    if (fileType?.includes('image')) return <Image className="w-5 h-5 text-purple-500" />
    return <FileArchive className="w-5 h-5 text-gray-500" />
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setCurrentPage(1)
  }

  if (loading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resource Management</h1>
        <Link 
          to="/admin/resources/upload" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Upload Resource
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter || 'All'}
            onChange={(e) => setCategoryFilter(e.target.value === 'All' ? '' : e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {(searchTerm || categoryFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No resources found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getFileIcon(resource.fileType, resource.category)}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {resource.category}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleStatus(resource)} 
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title={resource.status === 'active' ? 'Unpublish' : 'Publish'}
                    >
                      {resource.status === 'active' ? <EyeOff className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                    </button>
                    <Link to={`/resource/${resource._id}`} className="p-1.5 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => setShowDeleteModal(resource)} className="p-1.5 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 flex items-center gap-2">
                  {resource.title}
                  {resource.status === 'draft' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">Draft</span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{resource.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Download className="w-3 h-3" />

                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 truncate">By {resource.uploadedBy?.name || 'Unknown'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteModal(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Delete Resource</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-semibold">{showDeleteModal.title}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(showDeleteModal._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ResourceManagement