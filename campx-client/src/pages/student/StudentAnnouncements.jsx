import React, { useState, useEffect } from 'react'
import { announcementService } from '../../services/announcementService'
import { Pagination } from '../../components/Common/Pagination'
import { Loader } from '../../components/Common/Loader'
import { Search, Filter, X, Calendar, MapPin, ChevronRight, Bell, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const priorities = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  const types = [
    { value: 'exam', label: 'Exam' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'internship', label: 'Internship' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'placement', label: 'Placement' },
    { value: 'crt', label: 'CRT' },
    { value: 'sports', label: 'Sports' },
    { value: 'fee', label: 'Fee' },
    { value: 'lab', label: 'Lab' },
    { value: 'academic', label: 'Academic' },
    { value: 'event', label: 'Event' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'result', label: 'Result' },
    { value: 'general', label: 'General' }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements()
    }, 400)
    return () => clearTimeout(timer)
  }, [pagination.page, searchTerm, selectedPriority, selectedType])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        priority: selectedPriority,
        type: selectedType
      }
      const response = await announcementService.getAll(params)
      setAnnouncements(response.announcements || [])
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePriorityChange = (priority) => {
    setSelectedPriority(selectedPriority === priority ? '' : priority)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleTypeChange = (type) => {
    setSelectedType(selectedType === type ? '' : type)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedPriority('')
    setSelectedType('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getPriorityLabel = (priority) => {
    if (!priority) return 'Normal'
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const activeFiltersCount = (searchTerm ? 1 : 0) + (selectedPriority ? 1 : 0) + (selectedType ? 1 : 0)

  // Get type display name
  const getTypeLabel = (type) => {
    const found = types.find(t => t.value === type)
    return found?.label || type
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className=" mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Sparkles size={14} />
            <span>Stay Informed</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
        </div>
      </div>

      <div className="mx-auto px-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search announcements..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                <span className="text-sm">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Priority</h3>
                    <div className="flex flex-wrap gap-2">
                      {priorities.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => handlePriorityChange(p.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            selectedPriority === p.value
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {types.slice(0, 8).map((t) => (
                        <button
                          key={t.value}
                          onClick={() => handleTypeChange(t.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            selectedType === t.value
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {selectedType && !types.slice(0, 8).find(t => t.value === selectedType) && (
                      <button
                        onClick={() => handleTypeChange(selectedType)}
                        className="mt-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm"
                      >
                        {getTypeLabel(selectedType)}
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-400">Active:</span>
                      {selectedPriority && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                          Priority: {getPriorityLabel(selectedPriority)}
                          <button onClick={() => handlePriorityChange(selectedPriority)} className="text-gray-400 hover:text-gray-600">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {selectedType && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                          Category: {getTypeLabel(selectedType)}
                          <button onClick={() => handleTypeChange(selectedType)} className="text-gray-400 hover:text-gray-600">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                          Search: {searchTerm.length > 15 ? searchTerm.slice(0, 15) + '...' : searchTerm}
                          <button onClick={() => { setSearchTerm(''); setPagination(prev => ({ ...prev, page: 1 })) }} className="text-gray-400 hover:text-gray-600">
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      <button onClick={clearAllFilters} className="text-xs text-gray-400 hover:text-gray-600 underline">
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {pagination.total} announcement{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Announcements List */}
        {loading ? (
          <Loader />
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No announcements found</h3>
            <p className="text-sm text-gray-400">
              {activeFiltersCount > 0 ? 'Try adjusting your filters' : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((item, idx) => (
              <Link
                key={item._id}
                to={`/announcement/${item._id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Priority indicator bar */}
                    <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
                      item.priority === 'urgent' ? 'bg-red-500' :
                      item.priority === 'high' ? 'bg-orange-500' :
                      item.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      {/* Title and badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h2>
                        {item.priority && item.priority !== 'low' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                            item.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                            item.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {getPriorityLabel(item.priority)}
                          </span>
                        )}
                        {item.type && item.type !== 'general' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {getTypeLabel(item.type)}
                          </span>
                        )}
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
                        {item.description}
                      </p>
                      
                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            {item.location}
                          </div>
                        )}
                        {item.expiryDate && new Date(item.expiryDate) > new Date() && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Bell size={12} />
                            Expires {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
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

export default StudentAnnouncements