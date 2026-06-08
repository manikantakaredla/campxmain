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
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Download
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
      console.error('Error fetching dashboard:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.delete(id)
        toast.success('Announcement deleted')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete')
      }
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
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Manage your announcements, resources, and students</p>
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
          <Link to="/faculty/announcements" className="text-blue-600 text-sm mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
            Manage <ChevronRight className="w-3 h-3" />
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
          <Link to="/faculty/resources" className="text-green-600 text-sm mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
            Manage <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Class Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.classStudents}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <Link to="/faculty/students" className="text-purple-600 text-sm mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Proctor Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.proctorStudents}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <Link to="/faculty/students?type=proctor" className="text-orange-600 text-sm mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ChevronRight className="w-3 h-3" />
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
            <Link to="/faculty/announcements/create" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Create
            </Link>
          </div>
          
          {recentAnnouncements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement._id} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
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
                    </div>
                    <div className="flex gap-1">
                      <Link to={`/faculty/announcements/edit/${announcement._id}`} className="p-1 text-gray-400 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDeleteAnnouncement(announcement._id)} className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
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
            <Link to="/faculty/resources/upload" className="text-green-600 text-sm hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Upload
            </Link>
          </div>
          
          {recentResources.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No resources uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {recentResources.map((resource) => (
                <div key={resource._id} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {resource.category}
                        </span>
                        <span className="text-xs text-gray-400">{resource.downloads} downloads</span>
                      </div>
                      <h3 className="font-medium text-gray-800">{resource.title}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Link to={`/faculty/resources/edit/${resource._id}`} className="p-1 text-gray-400 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/faculty/announcements/create" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <Megaphone className="w-6 h-6 mb-2" />
          <h3 className="font-semibold">Create Announcement</h3>
          <p className="text-sm text-blue-100 mt-1">Share important updates with students</p>
        </Link>
        
        <Link to="/faculty/resources/upload" className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <FileText className="w-6 h-6 mb-2" />
          <h3 className="font-semibold">Upload Resource</h3>
          <p className="text-sm text-green-100 mt-1">Share study materials and notes</p>
        </Link>
        
        <Link to="/faculty/students" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <Users className="w-6 h-6 mb-2" />
          <h3 className="font-semibold">View Students</h3>
          <p className="text-sm text-purple-100 mt-1">Access your class and proctor students</p>
        </Link>
      </div>
    </div>
  )
}

export default FacultyDashboard