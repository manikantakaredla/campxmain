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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-5 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {user?.name?.split(' ')[0]} 
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Student Dashboard
              </p>
            </div>
           
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <TrendingUp size={14} className="text-green-500 hidden md:block" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.announcements}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">Announcements</p>
            <Link to="/student/announcements" className="text-xs md:text-sm font-medium text-blue-600 mt-2 md:mt-4 inline-flex items-center gap-1">
              View all <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-50 rounded-xl md:rounded-2xl flex items-center justify-center">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.resources}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">Resources</p>
            <Link to="/student/resources" className="text-xs md:text-sm font-medium text-green-600 mt-2 md:mt-4 inline-flex items-center gap-1">
              Browse <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-50 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.events}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">Events</p>
            <Link to="/student/calendar" className="text-xs md:text-sm font-medium text-purple-600 mt-2 md:mt-4 inline-flex items-center gap-1">
              Calendar <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              </div>
              {stats.unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-medium shadow-sm">
                  {stats.unreadNotifications}
                </span>
              )}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.unreadNotifications}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">Alerts</p>
            <Link to="/student/notifications" className="text-xs md:text-sm font-medium text-orange-600 mt-2 md:mt-4 inline-flex items-center gap-1">
              Check <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
            </Link>
          </div>
        </div>

        {/* Assigned Faculty Section */}
        {assignedFaculty && (assignedFaculty.classTeacher || assignedFaculty.proctor) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">My Assigned Faculty</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedFaculty.classTeacher && (
                <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {assignedFaculty.classTeacher.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Class Faculty</p>
                    <h3 className="font-semibold text-gray-900 truncate">{assignedFaculty.classTeacher.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{assignedFaculty.classTeacher.department}</p>
                  </div>
                  <Link to={`/student/messages?userId=${assignedFaculty.classTeacher._id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Chat with Class Teacher">
                    <MessageSquare size={18} />
                  </Link>
                </div>
              )}
              {assignedFaculty.proctor && (
                <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {assignedFaculty.proctor.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-0.5">Proctor</p>
                    <h3 className="font-semibold text-gray-900 truncate">{assignedFaculty.proctor.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{assignedFaculty.proctor.department}</p>
                  </div>
                  <Link to={`/student/messages?userId=${assignedFaculty.proctor._id}`} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors" title="Chat with Proctor">
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Megaphone size={14} className="text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-800">Recent Announcements</h2>
              </div>
              <Link to="/student/announcements" className="text-sm text-blue-600 hover:text-blue-700">
                See all
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentAnnouncements.length === 0 ? (
                <div className="py-12 text-center">
                  <Megaphone size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No announcements yet</p>
                </div>
              ) : (
                recentAnnouncements.map((item) => (
                  <Link 
                    key={item._id} 
                    to={`/announcement/${item._id}`}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-10 bg-blue-400 rounded-full flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {item.priority && item.priority !== 'normal' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityClass(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-800 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Resources */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText size={14} className="text-green-600" />
                </div>
                <h2 className="font-semibold text-gray-800">Recent Resources</h2>
              </div>
              <Link to="/student/resources" className="text-sm text-green-600 hover:text-green-700">
                Browse all
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentResources.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No resources yet</p>
                </div>
              ) : (
                recentResources.map((item) => (
                  <Link 
                    key={item._id} 
                    to={`/resource/${item._id}`}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{item.category}</span>
                          <span className="text-xs text-gray-400">
                            {item.downloads || 0} downloads
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-800 text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                      </div>
                      <Download size={14} className="text-gray-300 flex-shrink-0" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar size={14} className="text-purple-600" />
                </div>
                <h2 className="font-semibold text-gray-800">Upcoming Events</h2>
              </div>
              <Link to="/student/calendar" className="text-sm text-purple-600 hover:text-purple-700">
                View all
              </Link>
            </div>
            
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <Link 
                    key={event._id} 
                    to={`/activity/${event._id}`}
                    className="block p-3 md:p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-center min-w-[55px]">
                        <div className="text-2xl font-bold text-gray-700">
                          {new Date(event.startDate).getDate()}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mb-2">
                          {event.type}
                        </span>
                        <h3 className="font-medium text-gray-800 text-sm line-clamp-1">{event.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
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