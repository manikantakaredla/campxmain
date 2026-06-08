import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { announcementService } from '../../services/announcementService'
import { resourceService } from '../../services/resourceService'
import { calendarService } from '../../services/calendarService'
import { notificationService } from '../../services/notificationService'
import { 
  Bell, 
  Megaphone, 
  FileText, 
  Calendar, 
  GraduationCap,
  ChevronRight,
  Download,
  Eye
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [announcementsRes, resourcesRes, eventsRes, notifRes] = await Promise.all([
        announcementService.getAll({ page: 1, limit: 5 }),
        resourceService.getAll({ page: 1, limit: 5 }),
        calendarService.getUpcoming(),
        notificationService.getUnreadCount()
      ])

      setRecentAnnouncements(announcementsRes.announcements || [])
      setRecentResources(resourcesRes.resources || [])
      setUpcomingEvents(eventsRes.activities || [])
      setStats({
        announcements: announcementsRes.pagination?.total || 0,
        resources: resourcesRes.pagination?.total || 0,
        events: eventsRes.activities?.length || 0,
        unreadNotifications: notifRes.unreadCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name?.split(' ')[0]}! 
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Announcements</p>
              <p className="text-2xl font-bold text-gray-800">{stats.announcements}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <Link to="/student/announcements" className="text-blue-600 text-sm mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Resources</p>
              <p className="text-2xl font-bold text-gray-800">{stats.resources}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <Link to="/student/resources" className="text-green-600 text-sm mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
            Browse resources <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-800">{stats.events}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <Link to="/student/calendar" className="text-purple-600 text-sm mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
            View calendar <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Notifications</p>
              <p className="text-2xl font-bold text-gray-800">{stats.unreadNotifications}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <Link to="/student/notifications" className="text-orange-600 text-sm mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
            Check now <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Recent Announcements
            </h2>
            <Link to="/student/announcements" className="text-blue-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          
          {recentAnnouncements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((announcement) => (
                <Link 
                  key={announcement._id} 
                  to={`/announcement/${announcement._id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {announcement.priority || 'normal'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-800">{announcement.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{announcement.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Resources */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Recent Resources
            </h2>
            <Link to="/student/resources" className="text-green-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          
          {recentResources.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No resources available</p>
          ) : (
            <div className="space-y-3">
              {recentResources.map((resource) => (
                <Link 
                  key={resource._id} 
                  to={`/resource/${resource._id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {resource.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {resource.downloads} downloads
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-800">{resource.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{resource.description}</p>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Upcoming Events
          </h2>
          <Link to="/student/calendar" className="text-purple-600 text-sm hover:underline">
            View calendar
          </Link>
        </div>
        
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming events</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.slice(0, 3).map((event) => (
              <Link 
                key={event._id} 
                to={`/activity/${event._id}`}
                className="block p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="text-center min-w-[50px]">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Date(event.startDate).getDate()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full inline-block mb-1 ${
                      event.type === 'Exam Notice' ? 'bg-red-100 text-red-700' :
                      event.type === 'Workshop' ? 'bg-blue-100 text-blue-700' :
                      event.type === 'Placement Drive' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.type}
                    </span>
                    <h3 className="font-medium text-gray-800 text-sm">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{event.venue || 'TBA'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default StudentDashboard