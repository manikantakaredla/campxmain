import React, { createContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'https://campxserver.onrender.com')
      
      socketInstance.on('connect', () => {
        console.log('Socket connected')
        socketInstance.emit('join', user.id)
      })
      
      setSocket(socketInstance)
      
      return () => {
        socketInstance.disconnect()
      }
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}