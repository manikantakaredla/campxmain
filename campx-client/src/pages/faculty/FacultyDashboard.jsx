import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { announcementService } from '../../services/announcementService'
import { resourceService } from '../../services/resourceService'
import { facultyService } from '../../services/facultyService'
import { Link } from 'react-router-dom'
import { 
  Megaphone, 
  FileText, 
  Users, 
  Calendar,
  Plus,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Eye,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const FacultyDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    announcements: 0,
    resources: 0,
    classStudents: 0,
    proctorStudents: 0,
    activities: 0
  })
  const [recentAnnouncements, setRecentAnnouncements] = useState([])
  const [recentResources, setRecentResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [announcementsRes, resourcesRes, classStudentsRes, proctorStudentsRes] = await Promise.all([
        announcementService.getMyAnnouncements().catch(() => ({ announcements: [] })),
        resourceService.getAll({ limit: 5 }).catch(() => ({ resources: [] })),
        facultyService.getClassStudents().catch(() => ({ students: [] })),
        facultyService.getProctorStudents().catch(() => ({ students: [] }))
      ])

      setRecentAnnouncements(announcementsRes.announcements?.slice(0, 5) || [])
      setRecentResources(resourcesRes.resources?.slice(0, 5) || [])
      setStats({
        announcements: announcementsRes.announcements?.length || 0,
        resources: resourcesRes.resources?.length || 0,
        classStudents: classStudentsRes.students?.length || 0,
        proctorStudents: proctorStudentsRes.students?.length || 0,
        activities: 0
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await announcementService.delete(id)
        toast.success('Deleted')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-50 text-red-600'
      case 'high': return 'bg-orange-50 text-orange-600'
      case 'medium': return 'bg-yellow-50 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
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
    { 
      label: 'Announcements', 
      value: stats.announcements, 
      icon: Megaphone, 
      link: '/faculty/announcements',
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    { 
      label: 'Resources', 
      value: stats.resources, 
      icon: FileText, 
      link: '/faculty/resources',
      color: 'emerald',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    { 
      label: 'Class Students', 
      value: stats.classStudents, 
      icon: Users, 
      link: '/faculty/students',
      color: 'purple',
      bg: 'bg-purple-50',
      text: 'text-purple-600'
    },
    { 
      label: 'Proctor Students', 
      value: stats.proctorStudents, 
      icon: UserPlus, 
      link: '/faculty/students?type=proctor',
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600'
    }
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-5 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your class activities and resources
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/faculty/announcements/create"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                New Announcement
              </Link>
              <Link 
                to="/faculty/resources/upload"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <FileText size={16} />
                Upload Resource
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={18} className={card.text} />
                  </div>
                  <TrendingUp size={14} className="text-gray-300" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                <Link 
                  to={card.link} 
                  className="inline-flex items-center gap-1 text-xs font-medium mt-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  View details
                  <ChevronRight size={12} />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Megaphone size={14} className="text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Recent Announcements</h2>
              </div>
              <Link to="/faculty/announcements" className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentAnnouncements.length === 0 ? (
                <div className="py-12 text-center">
                  <Megaphone size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No announcements yet</p>
                  <Link to="/faculty/announcements/create" className="text-sm text-blue-600 mt-2 inline-block">
                    Create one →
                  </Link>
                </div>
              ) : (
                recentAnnouncements.map((item) => (
                  <div key={item._id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority || 'normal'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Link 
                          to={`/faculty/announcements/edit/${item._id}`} 
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit size={14} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteAnnouncement(item._id)} 
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Resources */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileText size={14} className="text-emerald-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Recent Resources</h2>
              </div>
              <Link to="/faculty/resources" className="text-sm text-emerald-600 hover:text-emerald-700">
                View all
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentResources.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No resources yet</p>
                  <Link to="/faculty/resources/upload" className="text-sm text-emerald-600 mt-2 inline-block">
                    Upload one →
                  </Link>
                </div>
              ) : (
                recentResources.map((item) => (
                  <div key={item._id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {item.downloads || 0} downloads
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Link 
                          to={`/faculty/resources/${item._id}`} 
                          className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          <Eye size={14} />
                        </Link>
                        {(item.uploadedBy === user?._id || item.uploadedBy?._id === user?._id) && (
                          <>
                            <Link 
                              to={`/faculty/resources/edit/${item._id}`} 
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit size={14} />
                            </Link>
                            <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/faculty/announcements/create"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Megaphone size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Create Announcement</p>
              <p className="text-xs text-gray-400">Share updates with students</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-blue-500" />
          </Link>

          <Link 
            to="/faculty/resources/upload"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <FileText size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Upload Resource</p>
              <p className="text-xs text-gray-400">Share study materials</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-emerald-500" />
          </Link>

          <Link 
            to="/faculty/students"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Users size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">View Students</p>
              <p className="text-xs text-gray-400">Class & proctor students</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-purple-500" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FacultyDashboard