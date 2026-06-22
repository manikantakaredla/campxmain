import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  Calendar,
  Users, UserPlus,
  GraduationCap,
  Upload,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  UserCircle,
  BookOpen,
  Briefcase,
  TrendingUp,
  MessageSquare
} from 'lucide-react'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Define menu items based on user role
  const getMenuItems = () => {
    const role = user?.role
    
    // Common items for all roles
    const commonItems = [
      { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
       { path: '/announcements', icon: <UserCircle size={20} />, label: 'Announcements' },
      { path: '/class-updates', icon: <BookOpen size={20} />, label: 'Class Updates' },
      { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
      { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
      { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
      { path: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
     
    ]

    // Student specific
    if (role === 'student') {
      return [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/announcements', icon: <UserCircle size={20} />, label: 'Announcements' },
        { path: '/class-updates', icon: <BookOpen size={20} />, label: 'Class Updates' },
        { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
        { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
        { path: '/opportunities', icon: <Briefcase size={20} />, label: 'Opportunities' },
        { path: '/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
        { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
        { path: '/profile', icon: <UserCircle size={20} />, label: 'Profile' }
      ]
    }
    
    // Faculty specific
    if (role === 'faculty') {
      return [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/students', icon: <Users size={20} />, label: 'Students' },
        { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
        { path: '/resources', icon: <FileText size={20} />, label: ' Resources' },
        { path: '/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
        { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
        { path: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
      ]
    }
    
    // HOD/Dean/Principal specific
    if (['hod', 'deputyhod', 'dean', 'principal'].includes(role)) {
      return [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/faculty', icon: <Briefcase size={20} />, label: 'Faculty Management' },
        { path: '/students', icon: <GraduationCap size={20} />, label: 'Department Students' },
        { path: '/assign-students', icon: <Users size={20} />, label: 'Assign Students' },
        { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
        { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
        { path: '/activities', icon: <Calendar size={20} />, label: 'Activities' },
        { path: '/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
        { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
        { path: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
        // Inside management menu items, add:
{ path: '/upload/class', icon: <Upload size={20} />, label: 'Upload CSV' },
      ]
    }
    
    // Admin specific
    if (role === 'admin') {
      return [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/users', icon: <Users size={20} />, label: 'User Management' },
        { path: '/faculty-management', icon: <Briefcase size={20} />, label: 'Faculty Management' },
        { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
        { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
        { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
        { path: '/opportunities', icon: <Briefcase size={20} />, label: 'Opportunities' },
        { path: '/placements/upload', icon: <Upload size={20} />, label: 'Upload Placements' },
        { path: '/placements/analytics', icon: <TrendingUp size={20} />, label: 'Placement Analytics' },
        { path: '/upload-data', icon: <Upload size={20} />, label: 'Upload Data' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
      ]
    }
    
    return commonItems
  }

  const menuItems = getMenuItems()
  const role = user?.role

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Base path for role-based routing
  const getBasePath = () => {
    if (role === 'student') return '/student'
    if (role === 'faculty') return '/faculty'
    if (['hod', 'deputyhod', 'dean', 'principal'].includes(role)) return '/management'
    if (role === 'admin') return '/admin'
    return ''
  }

  const basePath = getBasePath()

  return (
    <div
      className={`hidden md:flex bg-gray-900 text-white transition-all duration-300 flex-col ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-semibold text-sm">Aditya University</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">A</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg hover:bg-gray-800 transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* User Info */}
      <div className={`px-4 py-4 border-b border-gray-800 ${!sidebarOpen && 'text-center'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={`${basePath}${item.path}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } ${!sidebarOpen && 'justify-center'}`
            }
            title={!sidebarOpen ? item.label : ''}
          >
            {item.icon}
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all ${
            !sidebarOpen && 'justify-center'
          }`}
          title={!sidebarOpen ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar