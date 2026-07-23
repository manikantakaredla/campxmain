import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { Bell, User, LogOut, ChevronDown } from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import NotificationCenter from './NotificationCenter'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left Side / Search */}
        <div className="flex-1 max-w-xl">
          <GlobalSearch />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4 ml-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationCenter 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />

          <div className="w-px h-6 bg-gray-200 hidden sm:block mx-1"></div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden md:block max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={14} className="text-gray-400 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">{user?.role}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{user?.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link
                      to={`/${user?.role === 'student' ? 'student' : user?.role === 'faculty' ? 'faculty' : user?.role === 'admin' ? 'admin' : 'management'}/profile`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl w-full transition-colors group"
                    >
                      <User size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                        navigate('/');
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl w-full text-left transition-colors group"
                    >
                      <LogOut size={16} className="text-red-400 group-hover:text-red-500 transition-colors" />
                      Log Out
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