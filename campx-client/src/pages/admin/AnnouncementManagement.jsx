import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Megaphone, Eye, Trash2, Search, Filter, 
  ChevronLeft, ChevronRight, X, Calendar as CalIcon,
  AlertCircle, Users, MapPin, Plus, Edit
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const AnnouncementManagement = () => {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchAnnouncements()
  }, [currentPage, searchTerm, priorityFilter, audienceFilter])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        priority: priorityFilter,
        audience: audienceFilter
      }
      const response = await api.get('/announcements', { params })
      setAnnouncements(response.data.announcements || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`)
      toast.success('Announcement deleted successfully')
      setShowDeleteModal(null)
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to delete announcement')
    }
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    }
    return styles[priority] || 'bg-gray-100 text-gray-700'
  }

  const getAudienceBadge = (audience) => {
    const styles = {
      all: 'bg-purple-100 text-purple-700',
      students: 'bg-blue-100 text-blue-700',
      faculty: 'bg-green-100 text-green-700'
    }
    return styles[audience] || 'bg-gray-100 text-gray-700'
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPriorityFilter('')
    setAudienceFilter('')
    setCurrentPage(1)
  }

  if (loading && announcements.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcement Management</h1>
        </div>
        <button
          onClick={() => navigate('/admin/announcements/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Audiences</option>
            <option value="all">All Users</option>
            <option value="students">Students Only</option>
            <option value="faculty">Faculty Only</option>
          </select>
          {(searchTerm || priorityFilter || audienceFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Title</th>
                <th className="text-left p-4 font-semibold text-gray-600">Priority</th>
                <th className="text-left p-4 font-semibold text-gray-600">Audience</th>
                <th className="text-left p-4 font-semibold text-gray-600">Created By</th>
                <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    No announcements found
                  </td>
                </tr>
              ) : (
                announcements.map((announcement) => (
                  <tr key={announcement._id} className="border-t border-gray-100 hover:bg-gray-50 transition-all">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{announcement.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-1">{announcement.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(announcement.priority)}`}>
                        {announcement.priority || 'normal'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getAudienceBadge(announcement.audience)}`}>
                        {announcement.audience}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {announcement.createdBy?.name || 'Admin'}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {new Date(announcement.expiryDate) > new Date() ? (
                        <span className="text-xs text-green-600">Active</span>
                      ) : announcement.expiryDate ? (
                        <span className="text-xs text-gray-400">Expired</span>
                      ) : (
                        <span className="text-xs text-green-600">Active</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link 
                          to={`/announcement/${announcement._id}`} 
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link 
                          to={`/admin/announcements/edit/${announcement._id}`} 
                          className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setShowDeleteModal(announcement)} 
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteModal(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Delete Announcement</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-semibold">{showDeleteModal.title}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AnnouncementManagement