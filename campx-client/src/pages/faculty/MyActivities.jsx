import React, { useState, useEffect } from 'react'
import { calendarService } from '../../services/calendarService'
import { Loader } from '../../components/Common/Loader'
import { EmptyState } from '../../components/Common/EmptyState'
import { Calendar, Plus, Edit, Trash2, Eye, X, Clock, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyActivities = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Workshop',
    startDate: '',
    endDate: '',
    venue: '',
    targetAudience: {
      branch: '',
      year: '',
      section: ''
    }
  })

  // Activity types
  const activityTypes = [
    'Workshop', 'Internship', 'CRT Program', 'Placement Drive', 
    'Guest Lecture', 'Hackathon', 'Exam Notice'
  ]

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await calendarService.getAll({ limit: 50 })
      setActivities(response.activities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value }
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Workshop',
      startDate: '',
      endDate: '',
      venue: '',
      targetAudience: {
        branch: '',
        year: '',
        section: ''
      }
    })
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate) {
      toast.error('Please fill in title and start date')
      return
    }
    
    setSubmitting(true)
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        venue: formData.venue,
        targetAudience: {
          branch: formData.targetAudience.branch || null,
          year: formData.targetAudience.year ? parseInt(formData.targetAudience.year) : null,
          section: formData.targetAudience.section || null
        }
      }
      
      await calendarService.create(submitData)
      toast.success('Activity created successfully')
      setShowCreateModal(false)
      resetForm()
      fetchActivities()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create activity')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        venue: formData.venue,
        targetAudience: {
          branch: formData.targetAudience.branch || null,
          year: formData.targetAudience.year ? parseInt(formData.targetAudience.year) : null,
          section: formData.targetAudience.section || null
        }
      }
      
      await calendarService.update(selectedActivity._id, submitData)
      toast.success('Activity updated successfully')
      setShowEditModal(false)
      resetForm()
      fetchActivities()
    } catch (error) {
      toast.error('Failed to update activity')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await calendarService.delete(id)
        toast.success('Activity deleted')
        fetchActivities()
      } catch (error) {
        toast.error('Failed to delete activity')
      }
    }
  }

  const openEditModal = (activity) => {
    setSelectedActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description || '',
      type: activity.type,
      startDate: activity.startDate?.split('T')[0] || '',
      endDate: activity.endDate?.split('T')[0] || '',
      venue: activity.venue || '',
      targetAudience: {
        branch: activity.targetAudience?.branch || '',
        year: activity.targetAudience?.year || '',
        section: activity.targetAudience?.section || ''
      }
    })
    setShowEditModal(true)
  }

  const getTypeColor = (type) => {
    const colors = {
      'Workshop': 'bg-blue-100 text-blue-700',
      'Internship': 'bg-purple-100 text-purple-700',
      'CRT Program': 'bg-green-100 text-green-700',
      'Placement Drive': 'bg-orange-100 text-orange-700',
      'Guest Lecture': 'bg-indigo-100 text-indigo-700',
      'Hackathon': 'bg-pink-100 text-pink-700',
      'Exam Notice': 'bg-red-100 text-red-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'ongoing': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Activities</h1>
          <p className="text-gray-500 mt-1">Create and manage academic calendar events</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Activity
        </button>
      </div>

      {/* Activities List */}
      {loading ? (
        <Loader />
      ) : activities.length === 0 ? (
        <EmptyState 
          icon={<Calendar className="w-12 h-12" />}
          title="No activities yet"
          description="Create your first academic activity"
        />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(activity.type)}`}>
                      {activity.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{activity.title}</h2>
                  <p className="text-gray-600 line-clamp-2">{activity.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(activity.startDate).toLocaleDateString()}</span>
                    </div>
                    {activity.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{activity.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/activity/${activity._id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => openEditModal(activity)} className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(activity._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCreateModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Create Activity</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter activity title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter activity description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {activityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Seminar Hall, Online, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience (Optional)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Branch</label>
                    <input
                      type="text"
                      name="targetAudience.branch"
                      value={formData.targetAudience.branch}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="CSE, ECE, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Year</label>
                    <select
                      name="targetAudience.year"
                      value={formData.targetAudience.year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Years</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Section</label>
                    <input
                      type="text"
                      name="targetAudience.section"
                      value={formData.targetAudience.section}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="A, B, C"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Edit Activity</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    {activityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" name="targetAudience.branch" value={formData.targetAudience.branch} onChange={handleInputChange} className="px-3 py-2 border rounded-lg text-sm" placeholder="Branch" />
                  <select name="targetAudience.year" value={formData.targetAudience.year} onChange={handleInputChange} className="px-3 py-2 border rounded-lg text-sm">
                    <option value="">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <input type="text" name="targetAudience.section" value={formData.targetAudience.section} onChange={handleInputChange} className="px-3 py-2 border rounded-lg text-sm" placeholder="Section" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default MyActivities