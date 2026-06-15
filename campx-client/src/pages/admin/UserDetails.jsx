import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Mail, Phone, GraduationCap, Briefcase, 
  Building, Calendar, UserCheck, Edit, Save, X,
  CheckCircle, XCircle, Shield, Lock, BookOpen, Award,
  CalendarDays, MapPin, Hash
} from 'lucide-react'
import { Loader } from '../../components/common/Loader'
import toast from 'react-hot-toast'
import api from '../../services/api'

const UserDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`)
      setUser(response.data.user)
      setFormData(response.data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to load user details')
      navigate('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdateUser = async () => {
    setUpdating(true)
    try {
      await api.put(`/admin/users/${id}`, {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        isActive: formData.isActive,
        ...(user.role === 'student' && { 
          section: formData.section, 
          course: formData.course, 
          branch: formData.branch,
          currentYear: formData.currentYear,
          currentSemester: formData.currentSemester
        }),
        ...(user.role !== 'student' && { 
          department: formData.department, 
          designation: formData.designation 
        })
      })
      toast.success('User updated successfully')
      setIsEditing(false)
      fetchUser()
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setUpdating(false)
    }
  }

  const handleResetPassword = async () => {
    if (window.confirm('Reset password to default? The user will need to change it on next login.')) {
      try {
        await api.put(`/admin/users/${id}/reset-password`, { newPassword: 'Password@123' })
        toast.success('Password reset to default: Password@123')
      } catch (error) {
        toast.error('Failed to reset password')
      }
    }
  }

  const handleToggleStatus = async () => {
    try {
      await api.put(`/admin/users/${id}`, { isActive: !user.isActive })
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`)
      fetchUser()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (loading) return <Loader />
  if (!user) return null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
          <p className="text-gray-500 mt-1">View and manage user information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-6 ${user.role === 'student' ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{user.name?.charAt(0)}</span>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="opacity-90 capitalize">{user.role}</p>
                <p className="text-sm opacity-75">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-white flex items-center gap-2"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              {user.role !== 'admin' && (
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    user.isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {user.role === 'student' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                      <input type="text" name="course" value={formData.course || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                      <input type="text" name="branch" value={formData.branch || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <input type="text" name="section" value={formData.section || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
                      <select name="currentYear" value={formData.currentYear || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                      <select name="currentSemester" value={formData.currentSemester || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="">Select Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {user.role !== 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input type="text" name="department" value={formData.department || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input type="text" name="designation" value={formData.designation || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleUpdateUser} disabled={updating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  {updating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800">{user.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Student Academic Info */}
              {user.role === 'student' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <BookOpen size={14} /> Course
                      </p>
                      <p className="text-gray-800 font-medium">{user.course || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <GraduationCap size={14} /> Branch
                      </p>
                      <p className="text-gray-800 font-medium">{user.branch || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Hash size={14} /> Section
                      </p>
                      <p className="text-gray-800 font-medium">{user.section || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Year, Semester, Batch */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Award size={14} /> Current Year
                      </p>
                      <p className="text-gray-800 font-medium">{user.currentYear ? `${user.currentYear} Year` : 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <CalendarDays size={14} /> Current Semester
                      </p>
                      <p className="text-gray-800 font-medium">{user.currentSemester ? `Semester ${user.currentSemester}` : 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} /> Batch
                      </p>
                      <p className="text-gray-800 font-medium">{user.batch || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Hash size={14} /> Roll Number
                    </p>
                    <p className="text-gray-800 font-medium">{user.rollNumber || 'N/A'}</p>
                  </div>
                </>
              )}

              {/* Faculty Info */}
              {user.role !== 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building size={14} /> Department
                    </p>
                    <p className="text-gray-800 font-medium">{user.department || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Briefcase size={14} /> Designation
                    </p>
                    <p className="text-gray-800 font-medium">{user.designation || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">Role: {user.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {user.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Status: {user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={handleResetPassword}
                  className="px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-all flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Reset Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDetails