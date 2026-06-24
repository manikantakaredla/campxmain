import React, { useState, useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { useAuth } from '../../hooks/useAuth'
import { resourceService } from '../../services/resourceService'
import { SearchBar } from '../../components/common/SearchBar'
import { Pagination } from '../../components/common/Pagination'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import { FileText, Plus, Edit, Trash2, Eye, Download, X, Upload, EyeOff, UploadCloud } from 'lucide-react'
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

  const handleToggleStatus = async (resource) => {
    const newStatus = resource.status === 'active' ? 'draft' : 'active'
    if (newStatus === 'draft' && !window.confirm('Are you sure you want to unpublish this resource?')) return
    if (newStatus === 'active' && !window.confirm('Are you sure you want to publish this resource? Students will be notified.')) return
    
    try {
      await resourceService.update(resource._id, {
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

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('powerpoint')) return '📊'
    if (fileType?.includes('word')) return '📝'
    if (fileType?.includes('excel')) return '📈'
    if (fileType?.includes('image')) return '🖼️'
    return '📁'
  }

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">My Resources</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Upload and manage your study materials</p>
          </div>
          <Link
            to="/faculty/resources/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_2px_10px_-3px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_20px_-3px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 hover:bg-blue-700 transition-all duration-300"
          >
            <Upload className="w-4 h-4" />
            Upload Resource
          </Link>
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
            icon={<FileText className="w-12 h-12 text-gray-300" />}
            title="No resources yet"
            description="Upload your first resource to share with students"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <div key={resource._id} className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group">
                <div className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform">{getFileIcon(resource.fileType)}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-100 rounded-lg p-1">
                      <Link to={`/resource/${resource._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Only show Edit/Delete if user uploaded it */}
                      {(resource.uploadedBy === user?._id || resource.uploadedBy?._id === user?._id) && (
                        <>
                          <button 
                            onClick={() => handleToggleStatus(resource)} 
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title={resource.status === 'active' ? 'Unpublish' : 'Publish'}
                          >
                            {resource.status === 'active' ? <EyeOff className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                          </button>
                          <Link 
                            to={`/faculty/resources/edit/${resource._id}`} 
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(resource._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h3>
                  
                  {resource.status === 'draft' && (
                    <span className="inline-block mb-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-bold uppercase tracking-wider">Draft</span>
                  )}
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium flex-1">
                    {resource.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider bg-blue-50 text-blue-700">
                      {resource.category}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">
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
          <div className="mt-8">
            <Pagination 
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MyResources