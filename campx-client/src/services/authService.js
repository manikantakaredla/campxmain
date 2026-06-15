import api from './api'

export const authService = {
  registerStudent: async (data) => {
    const response = await api.post('/auth/register/student', data)
    return response.data
  },
  
  registerFaculty: async (data) => {
    const response = await api.post('/auth/register/faculty', data)
    return response.data
  },
  
  verifyOTP: async (data) => {
    const response = await api.post('/auth/verify-otp', data)
    return response.data
  },
  
  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email })
    return response.data
  },
  
  login: async (data) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
  
  forgotPassword: async (identifier) => {
    const response = await api.post('/auth/forgot-password', { identifier })
    return response.data
  },
  
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data)
    return response.data
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      console.error('Logout error:', e)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  
  getStoredUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  
  getStoredToken: () => {
    const token =
  localStorage.getItem('token') ||
  sessionStorage.getItem('token')
  },
}