import api from './api'

export const resourceService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await api.get(`/resources${query ? `?${query}` : ''}`)
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/resources/${id}`)
    return response.data
  },
  
  create: async (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    })
    const response = await api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  update: async (id, data) => {
    const response = await api.put(`/resources/${id}`, data)
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/resources/${id}`)
    return response.data
  },
  
  download: async (id) => {
    const response = await api.put(`/resources/download/${id}`)
    return response.data
  },
}