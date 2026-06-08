import React, { useState, useEffect } from 'react'
import { resourceService } from '../../services/resourceService'
import { SearchBar } from '../../components/Common/SearchBar'
import { Pagination } from '../../components/Common/Pagination'
import { Loader } from '../../components/Common/Loader'
import { EmptyState } from '../../components/Common/EmptyState'
import { FileText, Download, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const StudentResources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 })
  const [filters, setFilters] = useState({ search: '', category: '' })

  const categories = ['All', 'Notes', 'PPT', 'Assignment', 'Lab', 'Question Bank', 'Previous Papers', 'Other']

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
        category: filters.category === 'All' ? '' : filters.category
      }
      const response = await resourceService.getAll(params)
      setResources(response.resources || [])
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }))
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCategoryFilter = (category) => {
    setFilters(prev => ({ ...prev, category }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDownload = async (resourceId) => {
    try {
      const response = await resourceService.download(resourceId)
      if (response.success && response.fileUrl) {
        window.open(response.fileUrl, '_blank')
        toast.success('Download started')
      }
    } catch (error) {
      toast.error('Failed to download')
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return '📊'
    if (fileType?.includes('word')) return '📝'
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return '📈'
    if (fileType?.includes('image')) return '🖼️'
    return '📁'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learning Resources</h1>
        <p className="text-gray-500 mt-1">Access study materials, notes, and previous papers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-4">
          <SearchBar onSearch={handleSearch} placeholder="Search resources..." />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filters.category === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <Loader />
      ) : resources.length === 0 ? (
        <EmptyState 
          icon={<FileText className="w-12 h-12" />}
          title="No resources found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{getFileIcon(resource.fileType)}</div>
                  <span className="text-xs text-gray-400">{resource.downloads} downloads</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{resource.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {resource.category}
                  </span>
                  <div className="flex gap-2">
                    <Link 
                      to={`/resource/${resource._id}`}
                      className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDownload(resource._id)}
                      className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
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