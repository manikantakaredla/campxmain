import api from './api'

const facultyManagementService = {
  getFacultyList: async (params) => {
    const response = await api.get('/admin/faculty', { params })
    return response.data
  },

  getFacultyDetails: async (id) => {
    const response = await api.get(`/admin/faculty/${id}`)
    return response.data
  },

  updateFacultySubjects: async (id, data) => {
    const response = await api.put(`/admin/faculty/${id}/subjects`, data)
    return response.data
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/faculty/analytics')
    return response.data
  }
}

export default facultyManagementService
