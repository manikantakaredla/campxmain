import api from './api'

export const facultyService = {
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
}