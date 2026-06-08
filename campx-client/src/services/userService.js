import api from './api'

export const userService = {
  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/student/profile', data)
    return response.data
  },
  
  updatePhoneNumber: async (phoneNumber) => {
    const response = await api.put('/student/profile/phone', { phoneNumber })
    return response.data
  },
  
  updateProfilePicture: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.put('/student/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  changePassword: async (data) => {
    const response = await api.put('/student/change-password', data)
    return response.data
  },
  
  updateNotificationPreferences: async (preferences) => {
    const response = await api.put('/student/notification-preferences', preferences)
    return response.data
  },
}