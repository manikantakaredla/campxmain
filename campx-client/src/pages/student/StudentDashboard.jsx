import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { announcementService } from '../../services/announcementService'
import { resourceService } from '../../services/resourceService'
import { calendarService } from '../../services/calendarService'
import { notificationService } from '../../services/notificationService'
import api from '../../api/axios';
import { 
  Bell, 
  Megaphone, 
  FileText, 
  Calendar, 
  ChevronRight,
  Download,
  TrendingUp,
  Clock,
  ArrowRight,
  Briefcase,
  Award,
  Star,
  MessageSquare
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import QuickActions from '../../components/layout/QuickActions'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    announcements: 0,
    resources: 0,
    events: 0,
    unreadNotifications: 0
  })
  const [recentAnnouncements, setRecentAnnouncements] = useState([])
  const [recentResources, setRecentResources] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [assignedFaculty, setAssignedFaculty] = useState(null)
  
  // Loading states for individual widgets could be added if needed,
  // but for now we just render with empty/zero data until they load.
  
  useEffect(() => {
    fetchAnnouncements()
    fetchResources()
    fetchEvents()
    fetchNotifications()
    fetchAssignedFaculty()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAll({ page: 1, limit: 5 });
      setRecentAnnouncements(res.announcements || []);
      setStats(prev => ({ ...prev, announcements: res.pagination?.total || 0 }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }

  const fetchResources = async () => {
    try {
      const res = await resourceService.getAll({ page: 1, limit: 5 });
      setRecentResources(res.resources || []);
      setStats(prev => ({ ...prev, resources: res.pagination?.total || 0 }));
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

  const fetchEvents = async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

      const [upcomingRes, monthRes] = await Promise.all([
        calendarService.getUpcoming().catch(() => ({ activities: [] })),
        calendarService.getAll({ startDate: firstDayOfMonth, endDate: lastDayOfMonth, limit: 1 }).catch(() => ({ pagination: { total: 0 } }))
      ]);

      setUpcomingEvents(upcomingRes.activities || []);
      setStats(prev => ({ ...prev, events: monthRes.pagination?.total || 0 }));
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setStats(prev => ({ ...prev, unreadNotifications: res.unreadCount || 0 }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  const fetchAssignedFaculty = async () => {
    try {
      const res = await api.get('/student/assigned-faculty');
      setAssignedFaculty(res.data.data);
    } catch (error) {
      console.error('Error fetching assigned faculty:', error);
    }
  }

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-50 text-red-600 border-red-100';
      case 'high': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  }

  const statCards = [
    { label: 'Announcements', value: stats.announcements, icon: Megaphone, link: '/student/announcements', color: 'blue' },
    { label: 'Resources', value: stats.resources, icon: FileText, link: '/student/resources', color: 'green' },
    { label: 'Events', value: stats.events, icon: Calendar, link: '/student/calendar', color: 'purple' },
    { label: 'Notifications', value: stats.unreadNotifications, icon: Bell, link: '/student/notifications', color: 'orange' }
  ]

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Welcome, {user?.name?.split(' ')[0]}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
              Student Dashboard
            </p>
          </div>
        </div>

        <QuickActions actions={[
          { label: 'Register Event', icon: <Calendar size={18} />, path: '/student/events', className: 'bg-purple-50 hover:bg-purple-100 border-purple-200', iconClassName: 'text-purple-600', textClassName: 'text-purple-900' },
          { label: 'View Timetable', icon: <Clock size={18} />, path: '/student/timetable', className: 'bg-blue-50 hover:bg-blue-100 border-blue-200', iconClassName: 'text-blue-600', textClassName: 'text-blue-900' },
          { label: 'Book Faculty', icon: <Briefcase size={18} />, path: '/student/faculty-connect', className: 'bg-green-50 hover:bg-green-100 border-green-200', iconClassName: 'text-green-600', textClassName: 'text-green-900' },
          { label: 'Placement Dashboard', icon: <TrendingUp size={18} />, path: '/student/placement-readiness', className: 'bg-orange-50 hover:bg-orange-100 border-orange-200', iconClassName: 'text-orange-600', textClassName: 'text-orange-900' },
          { label: 'Raise Complaint', icon: <MessageSquare size={18} />, path: '/student/complaints', className: 'bg-red-50 hover:bg-red-100 border-red-200', iconClassName: 'text-red-600', textClassName: 'text-red-900' },
        ]} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shadow-sm">
                <Megaphone size={18} className="text-blue-600" />
              </div>
              <TrendingUp size={16} className="text-green-500 hidden md:block" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stats.announcements}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Announcements</p>
            </div>
            <Link to="/student/announcements" className="text-xs font-bold text-blue-600 mt-4 inline-flex items-center gap-1 hover:text-blue-800 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shadow-sm">
                <FileText size={18} className="text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stats.resources}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Resources</p>
            </div>
            <Link to="/student/resources" className="text-xs font-bold text-green-600 mt-4 inline-flex items-center gap-1 hover:text-green-800 transition-colors">
              Browse <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shadow-sm">
                <Calendar size={18} className="text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stats.events}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Events</p>
            </div>
            <Link to="/student/calendar" className="text-xs font-bold text-purple-600 mt-4 inline-flex items-center gap-1 hover:text-purple-800 transition-colors">
              Calendar <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shadow-sm relative">
                <Bell size={18} className="text-orange-600" />
              </div>
              {stats.unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-[10px] md:text-xs px-2 py-1 rounded-md font-bold shadow-sm">
                  {stats.unreadNotifications} New
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stats.unreadNotifications}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Alerts</p>
            </div>
            <Link to="/student/notifications" className="text-xs font-bold text-orange-600 mt-4 inline-flex items-center gap-1 hover:text-orange-800 transition-colors">
              Check <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Assigned Faculty Section */}
        {assignedFaculty && (assignedFaculty.classTeacher || assignedFaculty.proctor) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">My Assigned Faculty</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedFaculty.classTeacher && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 flex items-center gap-5 group">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-black text-2xl shadow-sm border-2 border-white group-hover:scale-105 transition-transform">
                      {assignedFaculty.classTeacher.name?.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Class Faculty</p>
                    <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">{assignedFaculty.classTeacher.name}</h3>
                    <p className="text-sm text-gray-500 truncate font-medium">{assignedFaculty.classTeacher.department}</p>
                  </div>
                  <Link to={`/student/messages?userId=${assignedFaculty.classTeacher._id}`} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:shadow-md transition-all duration-300" title="Chat with Class Teacher">
                    <MessageSquare size={18} />
                  </Link>
                </div>
              )}
              {assignedFaculty.proctor && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 flex items-center gap-5 group">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center font-black text-2xl shadow-sm border-2 border-white group-hover:scale-105 transition-transform">
                      {assignedFaculty.proctor.name?.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Proctor</p>
                    <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-purple-600 transition-colors">{assignedFaculty.proctor.name}</h3>
                    <p className="text-sm text-gray-500 truncate font-medium">{assignedFaculty.proctor.department}</p>
                  </div>
                  <Link to={`/student/messages?userId=${assignedFaculty.proctor._id}`} className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white hover:shadow-md transition-all duration-300" title="Chat with Proctor">
                    <MessageSquare size={18} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Megaphone size={18} className="text-blue-600" />
                </div>
                <h2 className="font-bold text-gray-900">Recent Announcements</h2>
              </div>
              <Link to="/student/announcements" className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                See all
              </Link>
            </div>
            
            <div className="flex-1 divide-y divide-gray-50">
              {recentAnnouncements.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Megaphone size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No announcements yet</p>
                </div>
              ) : (
                recentAnnouncements.map((item) => (
                  <Link 
                    key={item._id} 
                    to={`/announcement/${item._id}`}
                    className="block px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-12 bg-blue-400 rounded-full flex-shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          {item.priority && item.priority !== 'normal' && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getPriorityClass(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                            <Clock size={12} />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:border-blue-200 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shadow-sm">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Resources */}
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-xl">
                  <FileText size={18} className="text-green-600" />
                </div>
                <h2 className="font-bold text-gray-900">Recent Resources</h2>
              </div>
              <Link to="/student/resources" className="text-sm font-semibold text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                Browse all
              </Link>
            </div>
            
            <div className="flex-1 divide-y divide-gray-50">
              {recentResources.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No resources yet</p>
                </div>
              ) : (
                recentResources.map((item) => (
                  <Link 
                    key={item._id} 
                    to={`/resource/${item._id}`}
                    className="block px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border border-gray-200 group-hover:border-green-300 transition-colors">
                        <FileText size={20} className="text-gray-500 group-hover:text-green-600 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-gray-100 text-gray-600">{item.category}</span>
                          <span className="text-xs font-medium text-gray-400">
                            {item.downloads || 0} downloads
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-0.5 group-hover:text-green-600 transition-colors truncate">{item.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:border-green-200 group-hover:text-green-600 group-hover:bg-green-50 transition-all shadow-sm">
                        <Download size={14} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Calendar size={18} className="text-purple-600" />
                </div>
                <h2 className="font-bold text-gray-900">Upcoming Events</h2>
              </div>
              <Link to="/student/calendar" className="text-sm font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                View Calendar
              </Link>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <Link 
                    key={event._id} 
                    to={`/activity/${event._id}`}
                    className="block p-5 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group bg-white relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex items-start gap-4">
                      <div className="text-center min-w-[65px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group-hover:border-purple-200 transition-colors">
                        <div className="bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest py-1">
                          {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-black text-gray-800 py-2">
                          {new Date(event.startDate).getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 uppercase tracking-wider mb-2">
                          {event.type}
                        </span>
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-purple-700 transition-colors">{event.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1 flex items-center gap-1.5 font-medium">
                          <Star size={14} className="text-amber-400" />
                          {event.venue || 'Location TBA'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard