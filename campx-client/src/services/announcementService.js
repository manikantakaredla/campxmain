import api from './api'

export const announcementService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await api.get(`/announcements${query ? `?${query}` : ''}`)
    return response.data
  },
  
  getMyAnnouncements: async () => {
    const response = await api.get('/announcements/my')
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/announcements/${id}`)
    return response.data
  },
  
  create: async (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'contacts') {
        formData.append(key, JSON.stringify(data[key]))
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    })
    const response = await api.post('/announcements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  update: async (id, data) => {
    const response = await api.put(`/announcements/${id}`, data)
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`)
    return response.data
  },
}