import React, { createContext, useState, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'
import toast from 'react-hot-toast'

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socket = useSocket()

  useEffect(() => {
    if (socket) {
      socket.on('new-notification', (notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        toast.custom((t) => (
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-blue-500">
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
  }, [socket])

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