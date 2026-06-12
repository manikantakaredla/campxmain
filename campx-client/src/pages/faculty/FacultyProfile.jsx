import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { User, Mail, Phone, Briefcase, Building, Calendar, Users, UserCheck, UserPlus, Camera, Lock, Edit, Settings, GraduationCap, BookOpen } from 'lucide-react'
import { facultyService } from '../../services/facultyService'
import toast from 'react-hot-toast'

const FacultyProfile = () => {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    classStudents: 0,
    proctorStudents: 0,
    totalAssigned: 0
  })

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || ''
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [classRes, proctorRes] = await Promise.all([
          facultyService.getClassStudents({ limit: 1 }),
          facultyService.getProctorStudents({ limit: 1 })
        ])
        
        setStats({
          classStudents: classRes.pagination?.total || 0,
          proctorStudents: proctorRes.pagination?.total || 0,
          totalAssigned: (classRes.pagination?.total || 0) + (proctorRes.pagination?.total || 0)
        })
      } catch (error) {
        console.error('Error fetching faculty stats', error)
      }
    }
    
    if (user && user.role !== 'admin' && user.role !== 'student') {
      fetchStats()
    }
  }, [user])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await facultyService.updateProfile(formData)
      if (response.success) {
        updateUser({ ...user, ...response.user })
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New passwords do not match')
    }
    if (passwords.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters')
    }
    setLoading(true)
    try {
      const response = await facultyService.changePassword(passwords)
      if (response.success) {
        toast.success('Password changed successfully')
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file')
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image size must be less than 2MB')
    }

    try {
      const response = await facultyService.updateProfilePicture(file)
      if (response.success) {
        updateUser({ ...user, profilePicture: response.profilePicture })
        toast.success('Profile picture updated')
      }
    } catch (error) {
      toast.error('Failed to update profile picture')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Cover */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-700"></div>
            
            {/* Avatar */}
            <div className="px-4 pb-5 text-center relative">
              <div className="relative inline-block -mt-12 mb-3">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                    <span className="text-white text-2xl font-medium">{user?.name?.charAt(0) || 'F'}</span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-gray-500" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                  />
                </label>
              </div>

              <h2 className="text-lg font-medium text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500 capitalize mt-0.5">{user?.role}</p>
              <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                <Briefcase className="w-3 h-3" />
                {user?.employeeId || 'No ID'}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-100">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User className="w-4 h-4" />
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Professional Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Professional Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-gray-700">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-gray-700">{user?.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Designation</p>
                      <p className="text-gray-700">{user?.designation || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Department</p>
                      <p className="text-gray-700">{user?.department || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm md:col-span-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Joined</p>
                      <p className="text-gray-700">{new Date(user?.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Statistics */}
              {!['admin', 'student'].includes(user?.role) && (
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Student Assignments</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalAssigned}</p>
                      <p className="text-xs text-gray-500">Total Assigned</p>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-semibold text-gray-900">{stats.classStudents}</p>
                      <p className="text-xs text-gray-500">Class Students</p>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <UserPlus className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-2xl font-semibold text-gray-900">{stats.proctorStudents}</p>
                      <p className="text-xs text-gray-500">Proctor Students</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Update Profile Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Update Profile</h3>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-4 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                      <input 
                        type="password" 
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input 
                        type="password" 
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-4 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FacultyProfile