import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Megaphone, Eye, Trash2, Search, Filter, 
  ChevronLeft, ChevronRight, AlertCircle,
  Plus, Edit, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

const AnnouncementManagement = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchAnnouncements()
  }, [currentPage, searchTerm, priorityFilter, audienceFilter, statusFilter])

  const fetchAnnouncements = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      
      if (searchTerm) params.search = searchTerm
      if (priorityFilter) params.priority = priorityFilter
      if (audienceFilter) params.audience = audienceFilter
      if (statusFilter) params.status = statusFilter
      params.page = currentPage
      params.limit = itemsPerPage
      
      const response = await api.get('/announcements', { params })
      
      if (response.data && response.data.success !== false) {
        setAnnouncements(response.data.announcements || response.data.data || [])
        setTotalPages(response.data.pagination?.pages || Math.ceil((response.data.total || 0) / itemsPerPage) || 1)
        setTotalItems(response.data.pagination?.total || response.data.total || 0)
      } else {
        setAnnouncements([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      setError(error.response?.data?.message || 'Failed to load announcements')
      toast.error('Failed to load announcements')
      setAnnouncements([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await api.delete(`/announcements/${id}`)
      toast.success('Announcement deleted successfully')
      setShowDeleteModal(null)
      // Refresh current page
      fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error(error.response?.data?.message || 'Failed to delete announcement')
    } finally {
      setDeleting(false)
    }
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    const defaultStyle = 'bg-gray-100 text-gray-800'
    return styles[priority] || defaultStyle
  }

  const getPriorityLabel = (priority) => {
    if (!priority) return 'Normal'
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const getAudienceBadge = (audience) => {
    const styles = {
      all: 'bg-purple-100 text-purple-800',
      students: 'bg-blue-100 text-blue-800',
      faculty: 'bg-green-100 text-green-800'
    }
    const defaultStyle = 'bg-gray-100 text-gray-800'
    return styles[audience] || defaultStyle
  }

  const getAudienceLabel = (audience) => {
    if (!audience) return 'All Users'
    const labels = {
      all: 'All Users',
      students: 'Students',
      faculty: 'Faculty'
    }
    return labels[audience] || audience
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPriorityFilter('')
    setAudienceFilter('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Loading State
  if (loading && announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Loading announcements...</p>
      </div>
    )
  }

  // Error State
  if (error && announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchAnnouncements}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all platform announcements
              {totalItems > 0 && <span className="ml-1">({totalItems} total)</span>}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/announcements/create')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">All Audiences</option>
            <option value="all">All Users</option>
            <option value="students">Students</option>
            <option value="faculty">Faculty</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Drafts</option>
          </select>

          {(searchTerm || priorityFilter || audienceFilter || statusFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No announcements found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || priorityFilter || audienceFilter || statusFilter !== 'all'
                ? "Try adjusting your filters" 
                : "Get started by creating your first announcement"}
            </p>
            {(searchTerm || priorityFilter || audienceFilter || statusFilter !== 'all') ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin/announcements/create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Announcement
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Priority</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Audience</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Created By</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {announcements.map((announcement) => {
                    const isActive = !announcement.expiryDate || new Date(announcement.expiryDate) > new Date()
                    
                    return (
                      <tr key={announcement._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{announcement.title}</p>
                            {announcement.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-1">{announcement.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-xs px-2 py-1 rounded-full ${getPriorityBadge(announcement.priority)}`}>
                            {getPriorityLabel(announcement.priority)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-xs px-2 py-1 rounded-full ${getAudienceBadge(announcement.audience)}`}>
                            {getAudienceLabel(announcement.audience)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {announcement.createdBy?.name || 'Admin'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {announcement.status === 'draft' ? (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                              Draft
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              Active
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Expired</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link 
                              to={`/announcement/${announcement._id}`}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {(user?.role === 'admin' || user?._id === announcement.createdBy?._id) && (
                              <>
                                <Link 
                                  to={`/admin/announcements/edit/${announcement._id}`}
                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button 
                                  onClick={() => setShowDeleteModal(announcement)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Delete Announcement</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Are you sure you want to delete "<span className="font-medium text-gray-700">{showDeleteModal.title}</span>"?
                  </p>
                  <p className="text-xs text-gray-400 mt-2">This action cannot be undone.</p>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowDeleteModal(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(showDeleteModal._id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnnouncementManagement