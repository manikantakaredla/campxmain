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
  Star
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
  const [recentApplications, setRecentApplications] = useState([])
  const [upcomingOpportunities, setUpcomingOpportunities] = useState([])
  const [placementStats, setPlacementStats] = useState(null)
  const [successStories, setSuccessStories] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await Promise.all([
        announcementService.getAll({ page: 1, limit: 5 }),
        resourceService.getAll({ page: 1, limit: 5 }),
        calendarService.getUpcoming(),
        notificationService.getUnreadCount(),
        api.get('/opportunities?applied=true'), // Fetch recent applications
        api.get('/opportunities?status=Upcoming&limit=3'), // Upcoming opportunities
        api.get('/placements/statistics'), // Placement Stats
        api.get('/success-stories?limit=2') // Recent Success Stories
      ])

      setRecentAnnouncements(res[0].announcements || [])
      setRecentResources(res[1].resources || [])
      setUpcomingEvents(res[2].activities || [])
      setRecentApplications(res[4]?.data?.data?.slice(0, 3) || []) // Mock extracting apps
      setUpcomingOpportunities(res[5]?.data?.data?.slice(0, 3) || [])
      setPlacementStats(res[6]?.data?.overall || null)
      setSuccessStories(res[7]?.data?.data || [])
      setStats({
        announcements: res[0].pagination?.total || 0,
        resources: res[1].pagination?.total || 0,
        events: res[2].activities?.length || 0,
        unreadNotifications: res[3].unreadCount || 0
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Megaphone size={18} className="text-blue-600" />
              </div>
              <TrendingUp size={14} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.announcements}</p>
            <p className="text-sm text-gray-500 mt-1">Announcements</p>
            <Link to="/student/announcements" className="text-xs text-blue-600 mt-3 inline-flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.resources}</p>
            <p className="text-sm text-gray-500 mt-1">Resources</p>
            <Link to="/student/resources" className="text-xs text-green-600 mt-3 inline-flex items-center gap-1">
              Browse <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.events}</p>
            <p className="text-sm text-gray-500 mt-1">Upcoming Events</p>
            <Link to="/student/calendar" className="text-xs text-purple-600 mt-3 inline-flex items-center gap-1">
              View calendar <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Bell size={18} className="text-orange-600" />
              </div>
              {stats.unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats.unreadNotifications}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.unreadNotifications}</p>
            <p className="text-sm text-gray-500 mt-1">Unread</p>
            <Link to="/student/notifications" className="text-xs text-orange-600 mt-3 inline-flex items-center gap-1">
              Check now <ArrowRight size={12} />
            </Link>
          </div>
        </div>

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
                    className="block px-5 py-4 hover:bg-gray-50 transition-colors"
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
                    className="block px-5 py-4 hover:bg-gray-50 transition-colors"
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
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <Link 
                    key={event._id} 
                    to={`/activity/${event._id}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
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

        {/* My Applications Widget */}
        <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase size={14} className="text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-800">My Applications</h2>
            </div>
            <Link to="/student/opportunities" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentApplications.length === 0 ? (
              <div className="py-12 text-center">
                <Briefcase size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No recent applications</p>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app._id} className="block px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-gray-600">
                        {app.companyName?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 text-sm mb-1">{app.companyName}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{app.title}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                      {app.applicationStatus || 'Applied'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Missing Widgets Added --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Upcoming Opportunities */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Briefcase size={14} className="text-indigo-600" />
                </div>
                <h2 className="font-semibold text-gray-800">Upcoming Opportunities</h2>
              </div>
              <Link to="/student/opportunities" className="text-sm text-indigo-600 hover:text-indigo-700">View all</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingOpportunities.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No upcoming opportunities</div>
              ) : (
                upcomingOpportunities.map(op => (
                  <div key={op._id} className="p-4 flex gap-4 hover:bg-gray-50">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-600">
                      {op.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{op.companyName}</h3>
                      <p className="text-xs text-gray-500">{op.title}</p>
                      <div className="flex gap-2 mt-2">
                        {op.priority === 'High' && <span className="px-2 py-0.5 text-[10px] bg-red-50 text-red-700 rounded-full">High Priority</span>}
                        {op.registrationDeadline && <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full">Deadline: {new Date(op.registrationDeadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Placement Stats & Success Stories */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm overflow-hidden text-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-blue-200" />
                <h2 className="font-semibold">Placement Highlights</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Highest</p>
                  <p className="text-2xl font-bold">{placementStats?.highestPackage || 'N/A'}L</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Average</p>
                  <p className="text-2xl font-bold">{placementStats?.averagePackage || 'N/A'}L</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Total</p>
                  <p className="text-2xl font-bold">{placementStats?.totalPlacements || 0}</p>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star size={14} className="text-yellow-600" />
                  </div>
                  <h2 className="font-semibold text-gray-800">Recent Success Stories</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {successStories.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">No stories yet</div>
                ) : (
                  successStories.map(story => (
                    <div key={story._id} className="p-4 flex gap-4 hover:bg-gray-50 items-center">
                      {story.photo ? (
                        <img src={story.photo} className="w-10 h-10 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                          {story.studentName?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">{story.studentName}</h3>
                        <p className="text-xs text-blue-600 font-medium">{story.companyName} • {story.package} LPA</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default StudentDashboard