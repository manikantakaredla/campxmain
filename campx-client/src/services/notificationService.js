import api from './api'

export const notificationService = {
  getMyNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await api.get(`/notifications${query ? `?${query}` : ''}`)
    return response.data
  },
  
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread/count')
    return response.data
  },
  
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}`)
    return response.data
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all')
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  },
}