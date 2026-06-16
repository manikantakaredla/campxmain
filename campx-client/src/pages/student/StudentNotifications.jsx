import React, { useState, useEffect } from 'react'
import { notificationService } from '../../services/notificationService'
import { useNotifications } from '../../hooks/useNotifications'
import { Bell, CheckCheck, Megaphone, FileText, Calendar, Users, Clock, ChevronRight, Filter, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const StudentNotifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, setNotifications } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationService.getMyNotifications({ limit: 50 })
      setNotifications(response.notifications || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      markAsRead(id)
      toast.success('Marked as read')
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      markAllAsRead()
      toast.success('All marked as read')
    } catch (error) {
      toast.error('Failed to mark all')
    }
  }

  const getTypeConfig = (type) => {
    const configs = {
      announcement: { 
        icon: Megaphone, 
        label: 'Announcement',
        bg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200'
      },
      resource: { 
        icon: FileText, 
        label: 'Resource',
        bg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200'
      },
      activity: { 
        icon: Calendar, 
        label: 'Event',
        bg: 'bg-purple-50',
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200'
      },
      assignment: { 
        icon: Users, 
        label: 'Assignment',
        bg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        borderColor: 'border-amber-200'
      }
    }
    return configs[type] || { 
      icon: Bell, 
      label: 'Update', 
      bg: 'bg-gray-50', 
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    }
  }

  const truncateText = (text, maxLength = 80) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter)

  const filterOptions = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'announcement', label: 'Announcements', icon: Megaphone },
    { value: 'resource', label: 'Resources', icon: FileText },
    { value: 'activity', label: 'Events', icon: Calendar },
  ]

  const unreadNotifications = notifications.filter(n => !n.isRead).length

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className=" mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Bell size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Stay updated with your class activities
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-semibold text-gray-900">{notifications.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCheck size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Unread</p>
                <p className="text-lg font-semibold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
          {filterOptions.map(option => {
            const Icon = option.icon
            const isActive = filter === option.value
            const count = option.value === 'all' 
              ? notifications.length 
              : notifications.filter(n => n.type === option.value).length
            
            return (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                  isActive
                    ? 'bg-gray-400 text-white shadow-sm'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} />
                <span>{option.label}</span>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Inbox size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const typeConfig = getTypeConfig(notification.type)
              const Icon = typeConfig.icon
              const isUnread = !notification.isRead
              
              return (
                <div
                  key={notification._id}
                  className={`group bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
                    isUnread 
                      ? 'border-l-4 border-l-blue-500 border-gray-200 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={typeConfig.iconColor} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {isUnread && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-600 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {truncateText(notification.message, 100)}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={11} />
                                {getTimeAgo(notification.createdAt)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.bg} ${typeConfig.iconColor}`}>
                                {typeConfig.label}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUnread && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                title="Mark as read"
                              >
                                <CheckCheck size={16} />
                              </button>
                            )}
                            {notification.relatedId && (
                              <Link
                                to={`/${notification.type === 'announcement' ? 'announcement' : notification.type === 'resource' ? 'resource' : 'activity'}/${notification.relatedId}`}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    handleMarkAsRead(notification._id);
                                  }
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                              >
                                <ChevronRight size={16} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentNotifications