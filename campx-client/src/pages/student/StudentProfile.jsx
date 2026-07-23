import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/userService'
import { 
  User, Mail, Phone, GraduationCap, BookOpen, Calendar, 
  Save, Edit2, Camera, X, Lock, Eye, EyeOff, 
  Award, Hash, CalendarDays, CheckCircle, Bell, ToggleLeft, ToggleRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const StudentProfile = () => {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [assignedFaculty, setAssignedFaculty] = useState({ classTeacher: null, proctor: null })
  
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [submittingPassword, setSubmittingPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    section: '',
    resume: '',
    codingProfiles: {
      leetcode: '',
      github: '',
      linkedin: '',
      hackerrank: ''
    }
  })
  
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    announcements: true,
    placements: true,
    events: true,
    internships: true,
    emergencyAlerts: true
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        section: user.section || '',
        resume: user.resume || '',
        codingProfiles: {
          leetcode: user.codingProfiles?.leetcode || '',
          github: user.codingProfiles?.github || '',
          linkedin: user.codingProfiles?.linkedin || '',
          hackerrank: user.codingProfiles?.hackerrank || ''
        }
      })
      if (user.notificationPreferences) {
        setPreferences(user.notificationPreferences)
      }
    }
  }, [user])

  useEffect(() => {
    fetchAssignedFaculty()
  }, [])

  const fetchAssignedFaculty = async () => {
    try {
      const response = await api.get('/student/assigned-faculty')
      if (response.data.success) {
        setAssignedFaculty(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching assigned faculty:', error)
    }
  }

  const handleChange = (e) => {
    if (e.target.name.startsWith('coding_')) {
      const field = e.target.name.split('_')[1];
      setFormData({ 
        ...formData, 
        codingProfiles: { 
          ...formData.codingProfiles, 
          [field]: e.target.value 
        } 
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await userService.updateProfile(formData)
      if (response.success) {
        updateUser({ ...user, ...formData })
        toast.success('Profile updated successfully')
        setIsEditing(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    if (!passwordData.currentPassword) {
      toast.error('Please enter current password')
      return
    }
    
    setSubmittingPassword(true)
    try {
      const response = await api.put('/student/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      })
      
      if (response.data.success) {
        toast.success('Password changed successfully')
        setShowPasswordModal(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(response.data.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setSubmittingPassword(false)
    }
  }

  const handleTogglePreference = async (key) => {
    const newValue = !preferences[key];
    setPreferences({ ...preferences, [key]: newValue });
    
    try {
      const response = await api.put('/notifications/preferences', {
        [key]: newValue
      });
      if (response.data.success) {
        toast.success('Preference updated');
        updateUser({ ...user, notificationPreferences: { ...user.notificationPreferences, [key]: newValue } });
      }
    } catch (error) {
      toast.error('Failed to update preference');
      // Revert on fail
      setPreferences({ ...preferences, [key]: !newValue });
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }
    
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await userService.updateProfilePicture(formData)
      if (response.success) {
        updateUser({ ...user, profilePicture: response.profilePicture })
        toast.success('Profile picture updated')
      }
    } catch (error) {
      toast.error('Failed to update profile picture')
    } finally {
      setUploadingImage(false)
    }
  }

  const getSemesterText = (semester) => {
    if (!semester) return 'N/A'
    const num = parseInt(semester)
    if (num === 1) return '1st Semester'
    if (num === 2) return '2nd Semester'
    if (num === 3) return '3rd Semester'
    if (num === 4) return '4th Semester'
    if (num === 5) return '5th Semester'
    if (num === 6) return '6th Semester'
    if (num === 7) return '7th Semester'
    if (num === 8) return '8th Semester'
    return `${num}th Semester`
  }

  const getYearText = (year) => {
    if (!year) return 'N/A'
    const num = parseInt(year)
    if (num === 1) return '1st Year'
    if (num === 2) return '2nd Year'
    if (num === 3) return '3rd Year'
    if (num === 4) return '4th Year'
    return `${num}th Year`
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card - Left Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 p-6 md:p-8 text-center relative overflow-hidden">
            {/* Soft decorative background element */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90 rounded-t-[24px]" />
            
            {/* Avatar */}
            <div className="relative inline-block mb-4 mt-6 z-10">
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-medium text-gray-500">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-2 shadow-sm hover:bg-gray-50 transition-colors z-20"
              >
                {uploadingImage ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={14} className="text-gray-500" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </div>
            
            <h2 className="text-lg font-medium text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500 capitalize mt-0.5">{user?.role}</p>
            
            {/* Academic Information */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Roll Number</span>
                <span className="font-medium text-gray-900">{user?.rollNumber || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Course</span>
                <span className="font-medium text-gray-900">{user?.course || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Branch</span>
                <span className="font-medium text-gray-900">{user?.branch || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Section</span>
                <span className="font-medium text-gray-900">{user?.section || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Year</span>
                <span className="font-medium text-gray-900">{getYearText(user?.currentYear)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Semester</span>
                <span className="font-medium text-gray-900">{getSemesterText(user?.currentSemester)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Batch</span>
                <span className="font-medium text-gray-900">{user?.batch || '-'}</span>
              </div>
              
              {/* Class Teacher */}
              <div className="flex justify-between text-sm mt-4 pt-4 border-t border-gray-100">
                <span className="text-gray-500">Class Teacher</span>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    {assignedFaculty?.classTeacher?.name || 'Not Assigned'}
                  </span>
                  {assignedFaculty?.classTeacher?.phoneNumber && (
                    <div className="text-xs text-gray-500">{assignedFaculty.classTeacher.phoneNumber}</div>
                  )}
                  {assignedFaculty?.classTeacher?.email && !assignedFaculty.classTeacher.phoneNumber && (
                    <div className="text-xs text-gray-500">{assignedFaculty.classTeacher.email}</div>
                  )}
                </div>
              </div>
              
              {/* Proctor */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Proctor</span>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    {assignedFaculty?.proctor?.name || 'Not Assigned'}
                  </span>
                  {assignedFaculty?.proctor?.phoneNumber && (
                    <div className="text-xs text-gray-500">{assignedFaculty.proctor.phoneNumber}</div>
                  )}
                  {assignedFaculty?.proctor?.email && !assignedFaculty.proctor.phoneNumber && (
                    <div className="text-xs text-gray-500">{assignedFaculty.proctor.email}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form - Right Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-gray-900">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Edit2 size={14} />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Email - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter 10-digit mobile number"
                      className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="A, B, C"
                      className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Professional Section */}
                <div className="pt-4 border-t border-gray-100 mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Professional & Coding Profiles</h3>
                  <div className="space-y-4">
                    {/* Resume */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                      <input
                        type="url"
                        name="resume"
                        value={formData.resume}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="https://link-to-your-resume.pdf"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                    {/* LinkedIn */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        name="coding_linkedin"
                        value={formData.codingProfiles.linkedin}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="https://linkedin.com/in/username"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                    {/* GitHub */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                      <input
                        type="url"
                        name="coding_github"
                        value={formData.codingProfiles.github}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="https://github.com/username"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                    {/* LeetCode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LeetCode Username</label>
                      <input
                        type="text"
                        name="coding_leetcode"
                        value={formData.codingProfiles.leetcode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="username"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                    {/* HackerRank */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HackerRank Username</label>
                      <input
                        type="text"
                        name="coding_hackerrank"
                        value={formData.codingProfiles.hackerrank}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="username"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                          !isEditing ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={14} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Change Password Section */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Security</h3>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Lock size={14} />
                Change Password
              </button>
            </div>

            {/* Notification Preferences Section */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Bell size={16} />
                Notification Preferences
              </h3>
              
              <div className="space-y-4 mt-4">
                {[
                  { key: 'push', label: 'Push Notifications', desc: 'Receive notifications on your device' },
                  { key: 'announcements', label: 'Announcements', desc: 'Updates from the college' },
                  { key: 'events', label: 'Events & Activities', desc: 'Campus events and activities' },
                  { key: 'placements', label: 'Placement Drives', desc: 'Job and internship opportunities' },
                  { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Critical system and emergency updates' }
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{pref.label}</p>
                      <p className="text-xs text-gray-500">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => handleTogglePreference(pref.key)}
                      className={`transition-colors ${preferences[pref.key] ? 'text-blue-600' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                      {preferences[pref.key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={() => setShowPasswordModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[24px] shadow-2xl z-50 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-base font-medium text-gray-900">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submittingPassword} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {submittingPassword ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      </div>
    </div>
  )
}

export default StudentProfile