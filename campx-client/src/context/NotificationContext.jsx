import React, { createContext, useState, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socket = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => {
          if (res.data?.success) {
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.notifications?.filter(n => !n.isRead)?.length || 0);
          }
        })
        .catch(err => console.error('Failed to fetch notifications on load', err));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new-notification', (notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        toast.custom((t) => (
          <div 
            className="bg-white rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-blue-500 cursor-pointer"
            onClick={() => {
              toast.dismiss(t.id);
              if (notification.type === 'message') {
                let queryParam = 'userId=';
                if (notification.relatedId?.startsWith('class_') || notification.relatedId?.startsWith('subjectGroup_') || notification.relatedId?.startsWith('proctor_')) {
                  queryParam = 'groupId=';
                }
                navigate(`/${user?.role === 'admin' ? 'admin' : user?.role}/messages?${queryParam}${notification.relatedId}`);
              } else {
                let targetUrl = `/${user?.role === 'admin' ? 'admin' : user?.role}/notifications`;
                if (notification.relatedId) {
                  if (notification.category === 'announcement') targetUrl = `/announcement/${notification.relatedId}`;
                  else if (notification.category === 'resource') targetUrl = `/resource/${notification.relatedId}`;
                  else if (notification.category === 'activity') targetUrl = `/activity/${notification.relatedId}`;
                }
                navigate(targetUrl);
              }
            }}
          >
            <p className="font-semibold text-gray-800">{notification.title}</p>
            <p className="text-sm text-gray-600">{notification.message}</p>
          </div>
        ), { duration: 5000 })
      })
    }
    
    return () => {
      if (socket) {
        socket.off('new-notification')
      }
    }
  }, [socket, user, navigate])

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n._id === id ? { ...n, isRead: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      setNotifications,
      setUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  )
}