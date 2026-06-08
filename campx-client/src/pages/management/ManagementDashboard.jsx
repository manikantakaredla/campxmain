import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { 
  Users, Briefcase, GraduationCap, UserPlus, 
  Calendar, FileText, Megaphone,
  ChevronRight, UserCheck, Award,
  Upload, TrendingUp, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const ManagementDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalStudents: 0,
    pendingAssignments: 0
  })
  const [recentFaculty, setRecentFaculty] = useState([])
  const [recentStudents, setRecentStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const facultyRes = await api.get('/hod/faculty')
      const studentsRes = await api.get('/hod/students?limit=5')
      
      setStats({
        totalFaculty: facultyRes.data.faculty?.length || 0,
        totalStudents: studentsRes.data.total || 0,
        pendingAssignments: 0
      })
      setRecentFaculty(facultyRes.data.faculty?.slice(0, 5) || [])
      setRecentStudents(studentsRes.data.students?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'hod': return 'Head of Department'
      case 'deputyhod': return 'Deputy Head of Department'
      case 'dean': return 'Dean'
      case 'principal': return 'Principal'
      default: return 'Management'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {getRoleTitle()} • {user?.department || 'Department'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-700">Faculty Members</h3>
          <Link to="/management/faculty" className="text-sm text-gray-400 hover:text-blue-600 mt-2 inline-flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalStudents}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-700">Students</h3>
          <Link to="/management/students" className="text-sm text-gray-400 hover:text-green-600 mt-2 inline-flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">0</span>
          </div>
          <h3 className="text-sm font-medium text-gray-700">Pending Actions</h3>
          <Link to="/management/assign-students" className="text-sm text-gray-400 hover:text-orange-600 mt-2 inline-flex items-center gap-1">
            Assign now <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Faculty */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">Recent Faculty</h2>
              <Link to="/management/faculty" className="text-xs text-gray-400 hover:text-gray-600">
                View all
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-50">
            {recentFaculty.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No faculty members found
              </div>
            ) : (
              recentFaculty.map((faculty) => (
                <Link
                  key={faculty._id}
                  to={`/management/faculty/${faculty._id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {faculty.name?.charAt(0) || 'F'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{faculty.name}</p>
                      <p className="text-xs text-gray-400">{faculty.designation || 'Faculty'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">Recent Students</h2>
              <Link to="/management/students" className="text-xs text-gray-400 hover:text-gray-600">
                View all
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-50">
            {recentStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No students found
              </div>
            ) : (
              recentStudents.map((student) => (
                <Link
                  key={student._id}
                  to={`/management/students/${student._id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {student.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-400">{student.rollNumber || 'No roll number'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Bulk Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-800">Upload Class Assignments</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Assign class students via CSV</p>
            <button
              onClick={() => navigate('/management/upload/class')}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-800">Upload Proctor Assignments</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Assign proctor students via CSV</p>
            <button
              onClick={() => navigate('/management/upload/proctor')}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          to="/management/assign-students" 
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all group"
        >
          <UserPlus className="w-5 h-5 text-gray-500 mb-2" />
          <h3 className="text-sm font-medium text-gray-800">Assign Students</h3>
          <p className="text-xs text-gray-400 mt-1">Assign class and proctor students</p>
        </Link>
        
        <Link 
          to="/management/faculty" 
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all group"
        >
          <Briefcase className="w-5 h-5 text-gray-500 mb-2" />
          <h3 className="text-sm font-medium text-gray-800">Manage Faculty</h3>
          <p className="text-xs text-gray-400 mt-1">View department faculty members</p>
        </Link>
        
        <Link 
          to="/management/students" 
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all group"
        >
          <GraduationCap className="w-5 h-5 text-gray-500 mb-2" />
          <h3 className="text-sm font-medium text-gray-800">View Students</h3>
          <p className="text-xs text-gray-400 mt-1">View all department students</p>
        </Link>
      </div>
    </div>
  )
}

export default ManagementDashboard