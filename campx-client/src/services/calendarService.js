// src/services/calendarService.js
import api from './api'

export const calendarService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await api.get(`/calendar${query ? `?${query}` : ''}`)
    return response.data
  },
  
  getUpcoming: async () => {
    const response = await api.get('/calendar/upcoming')
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/calendar/${id}`)
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/calendar', data)
    return response.data
  },
  
  update: async (id, data) => {
    const response = await api.put(`/calendar/${id}`, data)
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/calendar/${id}`)
    return response.data
  },
}