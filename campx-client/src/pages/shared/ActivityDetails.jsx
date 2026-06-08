import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { calendarService } from '../../services/calendarService'
import { ArrowLeft, Calendar, MapPin, Clock, Users, User, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

const ActivityDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
  }, [id])

  const fetchActivity = async () => {
    try {
      const response = await calendarService.getById(id)
      if (response.success) {
        setActivity(response.activity)
      } else {
        toast.error('Activity not found')
        navigate(-1)
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
      toast.error('Failed to load activity')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'ongoing': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming'
      case 'ongoing': return 'Ongoing'
      case 'completed': return 'Completed'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!activity) {
    return null
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
              {getStatusText(activity.status)}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
              {activity.type}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{activity.title}</h1>

          {/* Description */}
          {activity.description && (
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">{activity.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {new Date(activity.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {new Date(activity.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {activity.endDate && ` - ${new Date(activity.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
            {activity.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{activity.venue}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Created by {activity.createdBy?.name}</span>
            </div>
          </div>

          {/* Target Audience */}
          {activity.targetAudience && (activity.targetAudience.branch || activity.targetAudience.year) && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Target Audience</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {activity.targetAudience.branch && (
                      <span className="text-sm text-blue-700">Branch: {activity.targetAudience.branch}</span>
                    )}
                    {activity.targetAudience.year && (
                      <span className="text-sm text-blue-700">Year: {activity.targetAudience.year}</span>
                    )}
                    {activity.targetAudience.section && (
                      <span className="text-sm text-blue-700">Section: {activity.targetAudience.section}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityDetails