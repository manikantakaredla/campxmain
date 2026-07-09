import React, { useState, useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { useAuth } from '../../hooks/useAuth'
import { resourceService } from '../../services/resourceService'
import { SearchBar } from '../../components/common/SearchBar'
import { Pagination } from '../../components/common/Pagination'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import { FileText, Plus, Edit, Trash2, Eye, Download, X, Upload, EyeOff, UploadCloud, Layers, ArrowLeft, File, FileSpreadsheet, FileArchive, Activity, CheckCircle, Clock } from 'lucide-react'
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
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeView, setActiveView] = useState('categories')
  const [trackingModal, setTrackingModal] = useState({ isOpen: false, resource: null, data: null, loading: false })

  const categoryCards = [
    { id: 'all', title: 'All Resources', icon: <Layers className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-blue-50', borderColor: 'border-blue-100', hoverBorder: 'hover:border-blue-300', value: '' },
    { id: 'notes', title: 'Notes', icon: <FileText className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100', hoverBorder: 'hover:border-indigo-300', value: 'Notes' },
    { id: 'ppt', title: 'Presentations', icon: <File className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-orange-50', borderColor: 'border-orange-100', hoverBorder: 'hover:border-orange-300', value: 'PPT' },
    { id: 'assignment', title: 'Assignments', icon: <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', hoverBorder: 'hover:border-emerald-300', value: 'Assignment' },
    { id: 'lab', title: 'Lab Manuals', icon: <FileArchive className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-teal-50', borderColor: 'border-teal-100', hoverBorder: 'hover:border-teal-300', value: 'Lab' },
    { id: 'qb', title: 'Question Banks', icon: <FileText className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-red-50', borderColor: 'border-red-100', hoverBorder: 'hover:border-red-300', value: 'Question Bank' },
    { id: 'papers', title: 'Previous Papers', icon: <FileArchive className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-purple-50', borderColor: 'border-purple-100', hoverBorder: 'hover:border-purple-300', value: 'Previous Papers' },
    { id: 'other', title: 'Other Materials', icon: <File className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-gray-50', borderColor: 'border-gray-200', hoverBorder: 'hover:border-gray-400', value: 'Other' }
  ]

  useEffect(() => {
    if (activeView === 'resources') {
      fetchResources()
    }
  }, [pagination.page, searchTerm, selectedCategory, activeView])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await resourceService.getAll({ 
        page: pagination.page, 
        limit: pagination.limit,
        search: searchTerm,
        resourceType: selectedCategory
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

  const handleCategoryClick = (categoryValue) => {
    setSelectedCategory(categoryValue)
    setPagination(prev => ({ ...prev, page: 1 }))
    setActiveView('resources')
  }

  const handleTrack = async (resource) => {
    setTrackingModal({ isOpen: true, resource, data: null, loading: true });
    try {
      const response = await resourceService.getCompletionStatus(resource._id);
      if (response.success) {
        setTrackingModal(prev => ({ ...prev, data: { completed: response.completed, pending: response.pending }, loading: false }));
      }
    } catch (error) {
      toast.error('Failed to load tracking data');
      setTrackingModal(prev => ({ ...prev, loading: false }));
    }
  };

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

        {activeView === 'categories' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categoryCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCategoryClick(card.value)}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border ${card.borderColor} ${card.bgColor} ${card.hoverBorder} transition-all duration-300 hover:shadow-lg group text-center cursor-pointer h-full`}
              >
                {card.icon}
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-700 transition-colors">{card.title}</h3>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Header for resources view */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveView('categories')}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium border border-gray-200 bg-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Categories
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedCategory === '' ? 'All Resources' : selectedCategory}
              </h2>
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
                  
                  {(resource.category === 'Assignment' || resource.resourceType === 'Assignment') && (
                    <div className="mt-3">
                      <button 
                        onClick={() => handleTrack(resource)}
                        className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Activity className="w-4 h-4" /> Track Completion
                      </button>
                    </div>
                  )}
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
          </>
        )}
      </div>

      {/* Tracking Modal */}
      {trackingModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Track Assignment</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{trackingModal.resource?.title}</p>
              </div>
              <button 
                onClick={() => setTrackingModal({ isOpen: false, resource: null, data: null, loading: false })}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {trackingModal.loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader />
                </div>
              ) : trackingModal.data ? (
                <div className="space-y-8">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Completed</p>
                        <p className="text-2xl font-bold text-emerald-800">{trackingModal.data.completed.length}</p>
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-center gap-4">
                      <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Pending</p>
                        <p className="text-2xl font-bold text-orange-800">{trackingModal.data.pending.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Completed List */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Completed Students
                      </h4>
                      {trackingModal.data.completed.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">No students have completed yet</p>
                      ) : (
                        <div className="space-y-3">
                          {trackingModal.data.completed.map(student => (
                            <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-emerald-200 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {student.name?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                                <p className="text-xs text-gray-500 uppercase font-medium truncate">{student.rollNumber || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pending List */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Pending Students
                      </h4>
                      {trackingModal.data.pending.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">All targeted students completed!</p>
                      ) : (
                        <div className="space-y-3">
                          {trackingModal.data.pending.map(student => (
                            <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-orange-200 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {student.name?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                                <p className="text-xs text-gray-500 uppercase font-medium truncate">{student.rollNumber || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyResources