import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { Bell, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-all"
        >
          <Menu size={20} className="text-gray-600" />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link
            to={`/${user?.role === 'student' ? 'student' : user?.role === 'faculty' ? 'faculty' : user?.role === 'admin' ? 'admin' : 'management'}/notifications`}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-all"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={16} className="text-gray-500 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-2">
                   
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        // Navigate to settings
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        localStorage.removeItem('token')
                        localStorage.removeItem('user')
                        navigate('/')
                        window.location.reload()
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar