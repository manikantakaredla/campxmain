import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { 
  Users, GraduationCap, Briefcase, Megaphone, 
  FileText, UserPlus, Upload, Settings,
  Eye, ArrowUpRight, Activity, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalAnnouncements: 0,
    totalResources: 0,
    pendingFaculty: 0,
    activeUsers: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      const data = response.data.stats || {}
      setStats({
        totalStudents: data.totalStudents || 0,
        totalFaculty: data.totalFaculty || 0,
        totalAnnouncements: data.totalAnnouncements || 0,
        totalResources: data.totalResources || 0,
        pendingFaculty: data.pendingFaculty || 0,
        activeUsers: data.activeUsers || 0
      })
      setRecentUsers(response.data.recentActivities?.users || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, change: '+12%', trend: 'up', color: 'blue', link: '/admin/users' },
    { label: 'Total Faculty', value: stats.totalFaculty, icon: Briefcase, change: '+5%', trend: 'up', color: 'purple', link: '/admin/users' },
    { label: 'Announcements', value: stats.totalAnnouncements, icon: Megaphone, change: '+8%', trend: 'up', color: 'orange', link: '/admin/announcements' },
    { label: 'Resources', value: stats.totalResources, icon: FileText, change: '+15%', trend: 'up', color: 'green', link: '/admin/resources' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, change: '+3%', trend: 'up', color: 'teal', link: '/admin/users' },
  ]

  const quickActions = [
    { icon: Upload, label: 'Upload Students', desc: 'Import student data', color: 'blue', link: '/admin/upload-data' },
    { icon: Upload, label: 'Upload Faculty', desc: 'Import faculty data', color: 'green', link: '/admin/upload-data' },
    { icon: Megaphone, label: 'Announcements', desc: 'Create new announcement', color: 'purple', link: '/admin/announcements' },
    { icon: Settings, label: 'Settings', desc: 'Configure platform', color: 'gray', link: '/admin/settings' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
       
       
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((item, idx) => (
          <Link
            key={idx}
            to={item.link}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-${item.color}-50 rounded-lg flex items-center justify-center`}>
                <item.icon size={18} className={`text-${item.color}-600`} />
              </div>
              
            </div>
            <p className="text-xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Recent users</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest registered users</p>
            </div>
            <Link to="/admin/users" className="text-xs text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>
          
          {recentUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No users yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentUsers.slice(0, 5).map((u) => (
                <div key={u._id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-700">{u.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                      u.role === 'faculty' ? 'bg-blue-50 text-blue-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                    <Link to={`/admin/users/${u._id}`} className="text-gray-400 hover:text-indigo-600">
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Quick actions</h3>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-8 h-8 bg-${action.color}-50 rounded-lg flex items-center justify-center`}>
                    <action.icon size={14} className={`text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{action.label}</p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Department Engagements */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Student Engagements Department Wise</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  { dept: 'CSE', count: 450, color: 'blue' },
                  { dept: 'ECE', count: 320, color: 'purple' },
                  { dept: 'IT', count: 280, color: 'green' },
                  { dept: 'MECH', count: 150, color: 'orange' },
                  { dept: 'CIVIL', count: 120, color: 'teal' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{item.dept}</span>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className={`bg-${item.color}-500 h-1.5 rounded-full`} 
                        style={{ width: `${Math.min((item.count / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard