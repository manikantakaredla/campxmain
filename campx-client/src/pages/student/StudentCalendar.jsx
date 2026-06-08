import React, { useState, useEffect } from 'react'
import { calendarService } from '../../services/calendarService'
import { Loader } from '../../components/Common/Loader'
import { 
  Calendar, ChevronLeft, ChevronRight, MapPin, Clock, 
  GraduationCap, Briefcase, Code, BookOpen, X,
  Filter, Trophy, Coffee, Zap, Users, Target, CalendarDays,
  List, Eye
} from 'lucide-react'

const StudentCalendar = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [showEventModal, setShowEventModal] = useState(false)
  const [viewMode, setViewMode] = useState('month')
  const [showFilters, setShowFilters] = useState(false)

  const eventTypes = [
    { value: 'all', label: 'All Events', icon: <Calendar size={14} />, color: 'bg-gray-100 text-gray-700' },
    { value: 'Workshop', label: 'Workshop', icon: <Briefcase size={14} />, color: 'bg-blue-100 text-blue-700' },
    { value: 'Internship', label: 'Internship', icon: <Target size={14} />, color: 'bg-purple-100 text-purple-700' },
    { value: 'CRT Program', label: 'CRT', icon: <BookOpen size={14} />, color: 'bg-green-100 text-green-700' },
    { value: 'Placement Drive', label: 'Placement', icon: <Briefcase size={14} />, color: 'bg-orange-100 text-orange-700' },
    { value: 'Guest Lecture', label: 'Guest Lecture', icon: <GraduationCap size={14} />, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'Hackathon', label: 'Hackathon', icon: <Code size={14} />, color: 'bg-pink-100 text-pink-700' },
    { value: 'Exam Notice', label: 'Exam', icon: <BookOpen size={14} />, color: 'bg-red-100 text-red-700' },
    { value: 'Sports', label: 'Sports', icon: <Trophy size={14} />, color: 'bg-emerald-100 text-emerald-700' },
  ]

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await calendarService.getAll({ limit: 200 })
      setActivities(response.activities || [])
    } catch (error) {
      console.error('Error fetching calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + increment)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatMonthYear = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const getEventsForDate = (day) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayStr}`
    
    let events = activities.filter(activity => {
      const activityDate = new Date(activity.startDate).toISOString().split('T')[0]
      return activityDate === dateStr
    })
    
    if (filterType !== 'all') {
      events = events.filter(e => e.type === filterType)
    }
    
    return events
  }

  const getEventTypeColor = (type) => {
    const found = eventTypes.find(t => t.label === type || t.value === type)
    return found?.color || 'bg-gray-100 text-gray-700'
  }

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-700',
      ongoing: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false })
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true })
    }
    
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false })
    }
    
    return days
  }

  const upcomingEvents = activities
    .filter(a => {
      if (filterType !== 'all' && a.type !== filterType) return false
      return new Date(a.startDate) >= new Date()
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 10)

  const activeFilterCount = filterType !== 'all' ? 1 : 0

  const formatEventTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Academic Calendar</h1>
              
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-all"
              >
                {viewMode === 'month' ? <List size={14} /> : <CalendarDays size={14} />}
                <span>{viewMode === 'month' ? 'List View' : 'Month View'}</span>
              </button>
              <button 
                onClick={goToToday}
                className="px-3 py-1.5 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-all"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Calendar Section */}
          <div className="lg:col-span-2">
            {viewMode === 'month' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Calendar Toolbar */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => changeMonth(-1)} 
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-all text-gray-600"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">{formatMonthYear(currentDate)}</h2>
                    <button 
                      onClick={() => changeMonth(1)} 
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-all text-gray-600"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      showFilters || activeFilterCount > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Filter size={14} />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    )}
                  </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex flex-wrap gap-1.5">
                      {eventTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFilterType(type.value)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            filterType === type.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {type.icon}
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                    {activeFilterCount > 0 && (
                      <button 
                        onClick={() => setFilterType('all')} 
                        className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <X size={12} /> Clear filters
                      </button>
                    )}
                  </div>
                )}

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="py-2.5 text-center text-xs font-semibold text-gray-500 tracking-wide">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {renderCalendarDays().map((day, idx) => {
                    const eventsOnDay = day.isCurrentMonth ? getEventsForDate(day.day) : []
                    const hasEvents = eventsOnDay.length > 0
                    const isToday = day.isCurrentMonth && 
                      day.day === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear()
                    
                    return (
                      <div
                        key={idx}
                        className={`min-h-[110px] p-1.5 border border-gray-100 transition-all ${
                          day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${hasEvents ? 'hover:bg-blue-50/20 cursor-pointer' : ''}`}
                      >
                        <span className={`text-sm font-medium w-7 h-7 inline-flex items-center justify-center rounded-full ${
                          isToday ? 'bg-blue-600 text-white shadow-sm' : ''
                        } ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                          {day.day}
                        </span>
                        
                        {hasEvents && (
                          <div className="mt-1 space-y-0.5">
                            {eventsOnDay.slice(0, 2).map((event, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowEventModal(true)
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer ${getEventTypeColor(event.type)}`}
                                title={event.title}
                              >
                                {event.title.length > 14 ? event.title.slice(0, 12) + '..' : event.title}
                              </div>
                            ))}
                            {eventsOnDay.length > 2 && (
                              <div className="text-[9px] text-gray-400 text-center">
                                +{eventsOnDay.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              // List View
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">All Events</h2>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                        showFilters ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      <Filter size={14} /> Filters
                    </button>
                  </div>
                  
                  {showFilters && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {eventTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFilterType(type.value)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            filterType === type.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {activities.filter(a => filterType === 'all' || a.type === filterType).length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                      <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>No events found</p>
                    </div>
                  ) : (
                    activities
                      .filter(a => filterType === 'all' || a.type === filterType)
                      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                      .map((event) => (
                        <div
                          key={event._id}
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventModal(true)
                          }}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-blue-700 flex-shrink-0">
                              <span className="text-xl font-bold">
                                {new Date(event.startDate).getDate()}
                              </span>
                              <span className="text-[9px] font-medium uppercase tracking-wide">
                                {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getEventTypeColor(event.type)}`}>
                                  {event.type}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(event.status)}`}>
                                  {getStatusLabel(event.status)}
                                </span>
                              </div>
                              <h4 className="text-base font-semibold text-gray-800 line-clamp-1">{event.title}</h4>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{formatEventTime(event.startDate)}</span>
                                </div>
                                {event.venue && (
                                  <div className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span className="truncate">{event.venue}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Clock size={16} />
                  Upcoming Events
                </h3>
                {activeFilterCount > 0 && (
                  <button 
                    onClick={() => setFilterType('all')} 
                    className="mt-2 text-xs text-blue-200 hover:text-white flex items-center gap-1"
                  >
                    <X size={12} /> Clear filter
                  </button>
                )}
              </div>
              
              <div className="p-3 max-h-[500px] overflow-y-auto">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No upcoming events</p>
                    {filterType !== 'all' && (
                      <button 
                        onClick={() => setFilterType('all')} 
                        className="mt-2 text-xs text-blue-600 hover:underline"
                      >
                        Show all events
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event._id}
                        onClick={() => {
                          setSelectedEvent(event)
                          setShowEventModal(true)
                        }}
                        className="flex gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <span className="text-base font-bold">
                            {new Date(event.startDate).getDate()}
                          </span>
                          <span className="text-[8px] font-medium uppercase">
                            {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${getStatusColor(event.status)}`}>
                              {getStatusLabel(event.status)}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h4>
                          {event.venue && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin size={10} />
                              <span className="truncate">{event.venue}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Event Summary</h4>
              <div className="space-y-2">
                {eventTypes.filter(t => t.value !== 'all').slice(0, 6).map(type => {
                  const count = activities.filter(a => a.type === type.value).length
                  return (
                    <div key={type.value} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${type.color.split(' ')[0]}`}>
                          {type.icon}
                        </div>
                        <span className="text-gray-600">{type.label}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{count}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500">Total Events</span>
                <span className="font-bold text-gray-800">{activities.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEventModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className={`p-4 rounded-t-xl ${getEventTypeColor(selectedEvent.type)} border-b`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedEvent.title}</h3>
                  <span className="text-xs text-gray-500">{selectedEvent.type}</span>
                </div>
                <button onClick={() => setShowEventModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-all">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{formatEventDate(selectedEvent.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{formatEventTime(selectedEvent.startDate)}</span>
                </div>
              </div>
              
              {selectedEvent.venue && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{selectedEvent.venue}</span>
                </div>
              )}
              
              <div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedEvent.status)}`}>
                  {getStatusLabel(selectedEvent.status)}
                </span>
              </div>
              
              {selectedEvent.description && (
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}
              
              <button
                onClick={() => setShowEventModal(false)}
                className="w-full mt-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default StudentCalendar