import api from './api'

const subjectService = {
  getSubjects: async (params) => {
    const response = await api.get('/subjects', { params })
    return response.data
  },

  createSubject: async (data) => {
    const response = await api.post('/subjects', data)
    return response.data
  },

  updateSubject: async (id, data) => {
    const response = await api.put(`/subjects/${id}`, data)
    return response.data
  },

  bulkAssignSubject: async (data) => {
    const response = await api.post('/subjects/bulk-assign', data)
    return response.data
  }
}

export default subjectService
