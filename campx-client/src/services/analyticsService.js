import api from './api'

export const analyticsService = {
  getItems: async () => {
    const response = await api.get('/analytics/items')
    return response.data
  },

  getItemAnalytics: async (type, id) => {
    const response = await api.get(`/analytics/item/${type}/${id}`)
    return response.data
  }
}
