import React, { useState, useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { announcementService } from '../../services/announcementService'
import { SearchBar } from '../../components/common/SearchBar'
import { Pagination } from '../../components/common/Pagination'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import { Megaphone, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const { settings } = useSettings()
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('my')

  useEffect(() => {
    fetchAnnouncements()
  }, [pagination.page, searchTerm, filterType])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = filterType === 'all'
        ? await announcementService.getAll()
        : await announcementService.getMyAnnouncements()
      let filtered = response.announcements || []
      if (searchTerm) {
        filtered = filtered.filter(a =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      setAnnouncements(filtered)
      setPagination(prev => ({
        ...prev,
        total: filtered.length,
        pages: Math.ceil(filtered.length / prev.limit)
      }))
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.delete(id)
        toast.success('Announcement deleted')
        fetchAnnouncements()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  const paginatedAnnouncements = announcements.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage and view announcements</p>
          </div>
          <Link
            to="/faculty/announcements/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_2px_10px_-3px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_20px_-3px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 hover:bg-blue-700 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] border border-gray-100 p-6 flex-1 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <button
                onClick={() => setFilterType('all')}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${filterType === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                All Announcements
              </button>
              <button
                onClick={() => setFilterType('my')}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${filterType === 'my' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                My Announcements
              </button>
            </div>
            <div className="w-full sm:w-72">
              <SearchBar onSearch={setSearchTerm} placeholder="Search announcements..." />
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : announcements.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="w-12 h-12 text-gray-300" />}
              title="No announcements"
              description={filterType === 'my' ? "You haven't created any announcements yet" : "No announcements found"}
            />
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {paginatedAnnouncements.map((announcement) => (
                <div key={announcement._id} className="p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 bg-white group">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider ${
                            announcement.priority === 'urgent' ? 'bg-red-50 text-red-700' :
                            announcement.priority === 'high' ? 'bg-orange-50 text-orange-700' :
                            announcement.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-green-50 text-green-700'
                          }`}>
                          {announcement.priority || 'NORMAL'}
                        </span>
                        <span className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 uppercase font-bold tracking-wider">
                          {announcement.audience}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base mb-1.5 truncate group-hover:text-blue-600 transition-colors">{announcement.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 font-medium">{announcement.description}</p>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white sm:shadow-sm sm:border border-gray-100 rounded-lg p-1">
                      <Link to={`/announcement/${announcement._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                      {filterType === 'my' && (
                        <>
                          <Link to={`/faculty/announcements/edit/${announcement._id}`} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(announcement._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyAnnouncements
