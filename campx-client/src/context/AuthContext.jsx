import React, { createContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const clearStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token =
          localStorage.getItem('token') ||
          sessionStorage.getItem('token')

        if (!token) {
          setLoading(false)
          return
        }

        const response = await authService.getMe()

        if (response.success && response.user) {
          setUser(response.user)
          setIsAuthenticated(true)
        } else {
          clearStorage()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        clearStorage()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData, token, rememberMe = false) => {
    clearStorage()

    if (rememberMe) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(userData))
    }

    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      // Remove FCM token from backend to stop receiving push notifications
      const cachedToken = localStorage.getItem('fcm_token');
      if (cachedToken) {
        await api.delete('/notifications/fcm-token', { data: { token: cachedToken } }).catch(e => console.error(e));
        localStorage.removeItem('fcm_token');
      }
      
      if (navigator.clearAppBadge) {
        navigator.clearAppBadge().catch(e => console.error(e));
      }

      await authService.logout()
    } catch (error) {
      console.error(error)
    }

    clearStorage()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)

    if (localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    if (sessionStorage.getItem('user')) {
      sessionStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}