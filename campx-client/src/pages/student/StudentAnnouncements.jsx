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
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans">
      {/* Hero Section with Vibrant Gradients */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-50 text-xs font-semibold mb-6 backdrop-blur-md shadow-sm">
            <Sparkles size={14} className="text-blue-300" />
            <span>Stay Informed</span>
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">Announcements</h1>
          <p className="text-blue-100/90 max-w-xl text-xs md:text-sm font-medium">
            Get the latest updates on academics, events, and opportunities directly from the university.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        {/* Glassmorphic Search and Filter Bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-4 md:p-5 mb-8 transition-all hover:shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search announcements..."
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white shadow-sm placeholder-gray-400 text-gray-800"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border transition-all font-semibold text-sm ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
              }`}
            >
              <Filter size={18} className={activeFiltersCount > 0 ? "text-indigo-600" : ""} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center ml-1 shadow-sm">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-gray-100 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Priority */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    Priority Level
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => handlePriorityChange(p.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          selectedPriority === p.value
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02] ring-2 ring-indigo-600 ring-offset-1'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {types.slice(0, 8).map((t) => (
                      <button
                        key={t.value}
                        onClick={() => handleTypeChange(t.value)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          selectedType === t.value
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02] ring-2 ring-indigo-600 ring-offset-1'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {selectedType && !types.slice(0, 8).find(t => t.value === selectedType) && (
                    <button
                      onClick={() => handleTypeChange(selectedType)}
                      className="mt-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-1"
                    >
                      {getTypeLabel(selectedType)}
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Active:</span>
                  {selectedPriority && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
                      Priority: {getPriorityLabel(selectedPriority)}
                      <button onClick={() => handlePriorityChange(selectedPriority)} className="text-indigo-400 hover:text-indigo-700 transition-colors bg-white rounded-full p-0.5 shadow-sm">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedType && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
                      Category: {getTypeLabel(selectedType)}
                      <button onClick={() => handleTypeChange(selectedType)} className="text-indigo-400 hover:text-indigo-700 transition-colors bg-white rounded-full p-0.5 shadow-sm">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
                      Search: {searchTerm.length > 15 ? searchTerm.slice(0, 15) + '...' : searchTerm}
                      <button onClick={() => { setSearchTerm(''); setPagination(prev => ({ ...prev, page: 1 })) }} className="text-indigo-400 hover:text-indigo-700 transition-colors bg-white rounded-full p-0.5 shadow-sm">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  <button onClick={clearAllFilters} className="text-xs font-semibold text-gray-400 hover:text-gray-700 underline transition-colors ml-2">
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Showing {pagination.total} announcement{pagination.total !== 1 ? 's' : ''}
          </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            {announcements.map((item, idx) => {
              const date = new Date(item.createdAt);
              const day = date.getDate();
              const month = date.toLocaleString('default', { month: 'short' });
              
              // New announcement logic (less than 3 days old)
              const isRecent = (new Date() - date) < (3 * 24 * 60 * 60 * 1000);

              return (
                <Link
                  key={item._id}
                  to={`/announcement/${item._id}`}
                  className="group flex bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                  style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both` }}
                >
                  {/* Priority Edge Indicator */}
                  <div className={`w-1.5 flex-shrink-0 transition-colors duration-300 ${
                    item.priority === 'urgent' ? 'bg-rose-500 group-hover:bg-rose-600' :
                    item.priority === 'high' ? 'bg-orange-500 group-hover:bg-orange-600' :
                    item.priority === 'medium' ? 'bg-amber-400 group-hover:bg-amber-500' :
                    'bg-indigo-400 group-hover:bg-indigo-500'
                  }`} />
                  
                  <div className="p-4 md:p-5 flex gap-3 md:gap-4 w-full">
                    {/* Calendar Date Block */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 md:w-14 md:h-16 rounded-xl bg-gray-50 border border-gray-100 shadow-sm group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">{month}</span>
                      <span className="text-xl md:text-2xl font-black text-gray-800 group-hover:text-indigo-700 transition-colors">{day}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h2 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 line-clamp-1 transition-colors pr-2">
                            {item.title}
                          </h2>
                          {isRecent && (
                            <span className="shrink-0 flex items-center justify-center">
                              <span className="relative flex h-2.5 w-2.5 mt-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                              </span>
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-500 text-xs line-clamp-2 mb-3">
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Meta Tags */}
                      <div className="flex items-center gap-2 mt-auto flex-wrap">
                        {item.priority && item.priority !== 'low' && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                            item.priority === 'urgent' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                            item.priority === 'high' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                            item.priority === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                            'bg-gray-50 border-gray-200 text-gray-600'
                          }`}>
                            {getPriorityLabel(item.priority)}
                          </span>
                        )}
                        {item.type && item.type !== 'general' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700">
                            {getTypeLabel(item.type)}
                          </span>
                        )}
                        {item.location && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 ml-auto font-medium">
                            <MapPin size={12} className="text-gray-300" /> 
                            <span className="truncate max-w-[100px]">{item.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
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