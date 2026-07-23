import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { Bell, User, LogOut, ChevronDown } from 'lucide-react'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()

  const handleNotificationClick = (notif) => {
    setShowNotifications(false);
    if (!notif.isRead && notif._id) {
      import('../../services/api').then(({ default: api }) => {
        api.put(`/notifications/${notif._id}`).catch(err => console.error(err));
      });
      if (typeof markAsRead === 'function') markAsRead(notif._id);
    }
    
    if (notif.type === 'message') {
      let queryParam = 'userId=';
      if (notif.relatedId?.startsWith('class_') || notif.relatedId?.startsWith('subjectGroup_') || notif.relatedId?.startsWith('proctor_')) {
        queryParam = 'groupId=';
      }
      navigate(`/${user?.role === 'admin' ? 'admin' : user?.role}/messages?${queryParam}${notif.relatedId}`);
    } else {
      navigate(`/${user?.role === 'admin' ? 'admin' : user?.role}/notifications`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-end px-6 py-3">
        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-[-40px] sm:right-0 mt-2 w-[90vw] sm:w-80 max-w-[360px] bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications?.length > 0 ? (
                      notifications.slice(0, 5).map((notif, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 border-b border-gray-50 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50'}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <p className="font-medium text-gray-800">{notif.title}</p>
                          <p className="text-gray-600 text-xs mt-1 truncate">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                    )}
                  </div>
                  <div className="p-2 bg-gray-50 border-t border-gray-100">
                    <Link
                      to={`/${user?.role === 'student' ? 'student' : user?.role === 'faculty' ? 'faculty' : user?.role === 'admin' ? 'admin' : 'management'}/notifications`}
                      onClick={() => setShowNotifications(false)}
                      className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

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
                    <Link
                      to={`/${user?.role === 'student' ? 'student' : user?.role === 'faculty' ? 'faculty' : user?.role === 'admin' ? 'admin' : 'management'}/profile`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                        navigate('/');
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
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