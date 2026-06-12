import React, { useState, useEffect } from 'react'
import { resourceService } from '../../services/resourceService'
import { SearchBar } from '../../components/Common/SearchBar'
import { Pagination } from '../../components/Common/Pagination'
import { Loader } from '../../components/Common/Loader'
import { EmptyState } from '../../components/Common/EmptyState'
import { FileText, Download, Eye, Clock, User, Filter, ChevronDown, Grid, List, ArrowUpDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const StudentResources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 })
  const [filters, setFilters] = useState({ search: '', category: '', sortBy: 'latest' })
  const [viewMode, setViewMode] = useState('grid')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const categories = [
    'All', 'Question Papers', 'PPTs', 'Notes', 
    'CSE', 'ECE', 'Civil', 'Mechanical'
  ]

  const sortOptions = [
    { value: 'latest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'popular', label: 'Most downloaded' },
    { value: 'az', label: 'A to Z' }
  ]

  useEffect(() => {
    fetchResources()
  }, [pagination.page, filters])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        category: filters.category === 'All' ? '' : filters.category,
        sortBy: filters.sortBy
      }
      const response = await resourceService.getAll(params)
      setResources(response.resources || [])
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }))
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoryChange = (category) => {
    setFilters(prev => ({ ...prev, category }))
    setPagination(prev => ({ ...prev, page: 1 }))
    setShowCategoryDropdown(false)
  }

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy }))
    setPagination(prev => ({ ...prev, page: 1 }))
    setShowSortDropdown(false)
  }

  const handleDownload = async (resourceId) => {
    try {
      const response = await resourceService.download(resourceId)
      if (response.success && response.fileUrl) {
        window.open(response.fileUrl, '_blank')
        toast.success('Download started')
      }
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const getFileIcon = (fileType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'PDF'
    if (ext === 'ppt' || ext === 'pptx') return 'PPT'
    if (ext === 'doc' || ext === 'docx') return 'DOC'
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return 'IMG'
    return 'FILE'
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return d.toLocaleDateString()
  }

  const getSortLabel = () => {
    const option = sortOptions.find(o => o.value === filters.sortBy)
    return option?.label || 'Newest first'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
        <p className="text-gray-500 mt-1">Study materials shared by your faculty</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search resources..." 
            />
          </div>
          
          <div className="flex gap-2">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown)
                  setShowSortDropdown(false)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                <Filter size={16} />
                <span>{filters.category || 'All'}</span>
                <ChevronDown size={14} />
              </button>
              
              {showCategoryDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          filters.category === cat ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown)
                  setShowCategoryDropdown(false)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                <ArrowUpDown size={16} />
                <span>{getSortLabel()}</span>
                <ChevronDown size={14} />
              </button>
              
              {showSortDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          filters.sortBy === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {filters.search && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-500">Search:</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{filters.search}</span>
            <button 
              onClick={() => handleSearch('')}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && resources.length > 0 && (
        <div className="text-sm text-gray-500 mb-4">
          Showing {resources.length} of {pagination.total} resources
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Loader />
      ) : resources.length === 0 ? (
        <EmptyState 
          icon={<FileText size={48} />}
          title="No resources found"
          description="Try different filters or check back later"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getFileIcon(resource.fileType, resource.fileName)}
                  </div>
                  <span className="text-xs text-gray-400">{resource.downloads || 0} downloads</span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{resource.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{resource.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {resource.uploadedBy?.name?.split(' ')[0] || 'Faculty'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(resource.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <Link
                    to={`/resource/${resource._id}`}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                  <button
                    onClick={() => handleDownload(resource._id)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getFileIcon(resource.fileType, resource.fileName)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{resource.description}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <div>{resource.downloads || 0} downloads</div>
                      <div className="mt-1">{formatDate(resource.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-400">
                      By {resource.uploadedBy?.name || 'Faculty'}
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to={`/resource/${resource._id}`}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDownload(resource._id)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Download
                      </button>
                    </div>
                  </div>
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
    </div>
  )
}

export default StudentResources