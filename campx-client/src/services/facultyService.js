import api from './api'

export const facultyService = {
  // Get all assigned students
  getAllAssignedStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await api.get(`/faculty/students/all${query ? `?${query}` : ''}`)
    return response.data
  },

  // Get workload summary
  getWorkloadSummary: async () => {
    const response = await api.get('/faculty/me/workload');
    return response.data;
  },

  // Get class assignments summary
  getClassAssignmentsSummary: async () => {
    const response = await api.get('/faculty/class-assignments-summary')
    return response.data
  },

  // Get class students
  getClassStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await api.get(`/faculty/students/class${query ? `?${query}` : ''}`)
    return response.data
  },
  
  // Get proctor students
  getProctorStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await api.get(`/faculty/students/proctor${query ? `?${query}` : ''}`)
    return response.data
  },
  
  // Search students
  searchStudents: async (query) => {
    const response = await api.get(`/faculty/students/search?q=${query}`)
    return response.data
  },
  
  // Get student details
  getStudentDetail: async (studentId) => {
    const response = await api.get(`/faculty/students/${studentId}`)
    return response.data
  },
  
  // Update Profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data)
    return response.data
  },
  
  // Update Profile Picture
  updateProfilePicture: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.put('/auth/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  // Change Password
  changePassword: async (data) => {
    const response = await api.put('/auth/change-password', data)
    return response.data
  }
}