import React, { useState, useEffect } from 'react'
import { announcementService } from '../../services/announcementService'
import { Pagination } from '../../components/common/Pagination'
import { Loader } from '../../components/common/Loader'
import { Search, Filter, X, Calendar, MapPin, ChevronRight, Bell, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [forClass, setForClass] = useState(false)
  
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
  }, [pagination.page, searchTerm, selectedPriority, selectedType, forClass])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        priority: selectedPriority,
        type: selectedType,
        ...(forClass && { forClass: 'true' })
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
    <div className="min-h-screen bg-gray-50/30 pb-20 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 relative z-20">
        
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Announcements</h1>
          <button className="text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Search size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-800 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search announcements..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[16px] text-sm font-semibold focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all shadow-sm placeholder-gray-400"
          />
        </div>

        {/* Horizontal Pills Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={clearAllFilters}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              !selectedPriority && !selectedType ? 'bg-blue-100 text-blue-900' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          
          {/* Use priorities and some types as pills to match mockup style */}
          <button
            onClick={() => handlePriorityChange('high')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              selectedPriority === 'high' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Important
          </button>
          <button
            onClick={() => handleTypeChange('academic')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              selectedType === 'academic' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Academic
          </button>
          <button
            onClick={() => handleTypeChange('general')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              selectedType === 'general' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Admin
          </button>
        </div>


        {/* Announcements Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center max-w-2xl mx-auto mt-8">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📢</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No announcements found</h3>
            <p className="text-gray-500 font-medium">
              {activeFiltersCount > 0 ? "Try adjusting your filters to see more results." : "You're all caught up! Check back later for updates."}
            </p>
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {announcements.map((item, idx) => {
              const date = new Date(item.createdAt);
              const day = date.getDate();
              const month = date.toLocaleString('default', { month: 'short' });
              const year = date.getFullYear();
              
              const isRecent = (new Date() - date) < (3 * 24 * 60 * 60 * 1000);
              
              // Icon block styles based on type/priority
              const getIconStyle = () => {
                if (item.priority === 'urgent' || item.priority === 'high') return 'bg-purple-100 text-purple-700';
                if (item.type === 'academic' || item.type === 'exam') return 'bg-blue-100 text-blue-700';
                if (item.type === 'event' || item.type === 'workshop') return 'bg-orange-100 text-orange-600';
                return 'bg-green-100 text-green-700';
              }

              return (
                <Link
                  key={item._id}
                  to={`/announcement/${item._id}`}
                  className="flex items-center gap-4 bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                  style={{ animation: `fadeInUp 0.3s ease-out ${idx * 0.05}s both` }}
                >
                  {/* Left Icon Block */}
                  <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[14px] ${getIconStyle()}`}>
                    <Bell size={20} className="fill-current" />
                  </div>
                  
                  {/* Middle Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-gray-900 truncate mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500">
                      {day} {month} {year} • {item.author?.name || 'Admin'}
                    </p>
                  </div>
                  
                  {/* Right Badges & Chevron */}
                  <div className="flex items-center gap-3">
                    {isRecent && (
                      <span className="text-[10px] font-extrabold px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                        New
                      </span>
                    )}
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-10 pb-8 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default StudentAnnouncements