import api from './api'

export const announcementService = {
  // Get all announcements with filters
  getAll: async (params = {}) => {
    const query = new URLSearchParams()

    if (params.page) query.append('page', params.page)
    if (params.limit) query.append('limit', params.limit)
    if (params.search) query.append('search', params.search)
    if (params.priority) query.append('priority', params.priority)
    if (params.type && params.type !== 'all') query.append('type', params.type)
    if (params.status) query.append('status', params.status)
    if (params.audience) query.append('audience', params.audience)
    if (params.forClass === true) query.append('forClass', 'true')

    const response = await api.get(
      `/announcements${query.toString() ? `?${query.toString()}` : ''}`
    )

    return response.data
  },

  // Get announcements created by current user
  getMyAnnouncements: async () => {
    const response = await api.get('/announcements/my')
    return response.data
  },

  // Get single announcement by ID
  getById: async (id) => {
    const response = await api.get(`/announcements/${id}`)
    return response.data
  },

  // Create announcement
  create: async (data) => {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        if (
          typeof data[key] === 'object' &&
          !(data[key] instanceof File)
        ) {
          formData.append(key, JSON.stringify(data[key]))
        } else {
          formData.append(key, data[key])
        }
      }
    })

    const response = await api.post(
      '/announcements',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return response.data
  },

  // Update announcement
  update: async (id, data) => {
    const response = await api.put(`/announcements/${id}`, data)
    return response.data
  },

  // Delete announcement
  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`)
    return response.data
  },

  // Mark as read
  markAsRead: async (id) => {
    const response = await api.put(`/announcements/${id}/read`)
    return response.data
  },

  // Announcement types
  getTypes: async () => {
    const response = await api.get('/announcements/types')
    return response.data
  },

  // Search students
  searchStudents: async (query) => {
    const response = await api.get(
      `/announcements/search-students?q=${query}`
    )
    return response.data
  },

  // Faculty assigned data
  getFacultyAssignedData: async () => {
    const response = await api.get('/announcements/faculty-data')
    return response.data
  },

  // Class Teacher Announcements
  getClassTeacherAnnouncements: async (params = {}) => {
    const query = new URLSearchParams(params).toString()

    const response = await api.get(
      `/announcements/class-teacher${query ? `?${query}` : ''}`
    )

    return response.data
  },

  // Proctor Announcements
  getProctorAnnouncements: async (params = {}) => {
    const query = new URLSearchParams(params).toString()

    const response = await api.get(
      `/announcements/proctor${query ? `?${query}` : ''}`
    )

    return response.data
  },

  // Combined Updates
  getCombinedClassUpdates: async (params = {}) => {
    const query = params.limit
      ? `?limit=${params.limit}`
      : ''

    const [classRes, proctorRes] = await Promise.all([
      api.get(`/announcements/class-teacher${query}`),
      api.get(`/announcements/proctor${query}`)
    ])

    const classAnnouncements =
      classRes.data?.announcements || []

    const proctorAnnouncements =
      proctorRes.data?.announcements || []

    return {
      success: true,
      announcements: [
        ...classAnnouncements,
        ...proctorAnnouncements
      ].sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      ),
      classAnnouncements,
      proctorAnnouncements
    }
  }
}