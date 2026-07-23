import React, { useContext, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { SocketContext } from '../../context/SocketContext'
import toast from 'react-hot-toast'
import SidebarSection from './SidebarSection'
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
  MessageSquare,
  Sparkles,
  ShieldAlert,
  MapPin,
  Target,
  AlertCircle,
  Ticket,
  Database
} from 'lucide-react'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const socket = useContext(SocketContext)

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg) => {
        if (!location.pathname.includes('/messages')) {
          toast((t) => (
             <div className="flex flex-col gap-1 cursor-pointer" onClick={() => { toast.dismiss(t.id); navigate(`/${user?.role}/messages?userId=${msg.sender?._id || ''}`); }}>
               <p className="font-bold text-sm text-blue-600">New Message</p>
               <p className="text-xs font-semibold text-gray-800">{msg.sender?.name || 'Someone'}</p>
               <p className="text-xs text-gray-600 line-clamp-1">{msg.content}</p>
             </div>
          ), { duration: 4000 });
        }
      };
      socket.on('newMessage', handleNewMessage);
      return () => socket.off('newMessage', handleNewMessage);
    }
  }, [socket, location.pathname, navigate]);

  // Define menu items based on user role
  const getMenuItems = () => {
    const role = user?.role
    
    // Common items for all roles if fallback needed
    const commonItems = [
      { type: 'item', path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    ]

    // Student specific
    if (role === 'student') {
      return [
        { type: 'item', path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        {
          type: 'group',
          label: 'Academics',
          items: [
            { path: '/timetable', icon: <MapPin size={20} />, label: 'Smart Timetable' },
            { path: '/class-updates', icon: <BookOpen size={20} />, label: 'Class Updates' },
            { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
            { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
          ]
        },
        {
          type: 'group',
          label: 'Campus',
          items: [
            { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
            { path: '/events', icon: <Ticket size={20} />, label: 'Events' },
            { path: '/feed', icon: <Sparkles size={20} />, label: 'My Feed' },
            { path: '/sos', icon: <ShieldAlert size={20} className="text-red-500" />, label: 'Campus SOS' },
          ]
        },
        {
          type: 'group',
          label: 'Career',
          items: [
            { path: '/opportunities', icon: <Briefcase size={20} />, label: 'Opportunities' },
            { path: '/placement-readiness', icon: <Target size={20} />, label: 'Placement Readiness' },
          ]
        },
        {
          type: 'group',
          label: 'Faculty Connect',
          items: [
            { path: '/faculty-connect', icon: <Users size={20} />, label: 'Find Faculty' }
          ]
        },
        {
          type: 'group',
          label: 'Communication',
          items: [
            { path: '/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
            { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
          ]
        },
        {
          type: 'group',
          label: 'Support',
          items: [
            { path: '/complaints', icon: <AlertCircle size={20} />, label: 'Complaints & Grievances' },
          ]
        },
        {
          type: 'group',
          label: 'Account',
          items: [
            { path: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
          ]
        }
      ]
    }
    
    // Faculty specific
    if (role === 'faculty') {
      return [
        { type: 'item', path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        {
          type: 'group',
          label: 'Teaching',
          items: [
            { path: '/students', icon: <Users size={20} />, label: 'Students' },
            { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
            { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
          ]
        },
        {
          type: 'group',
          label: 'Activities',
          items: [
            { path: '/events', icon: <Ticket size={20} />, label: 'Events Management' },
            { path: '/activities', icon: <Calendar size={20} />, label: 'Academic Activities' }
          ]
        },
        {
          type: 'group',
          label: 'Analytics',
          items: [
            { path: '/analytics', icon: <TrendingUp size={20} />, label: 'Analytics' },
          ]
        },
        {
          type: 'group',
          label: 'Communication',
          items: [
            { path: '/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
            { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
          ]
        },
        {
          type: 'group',
          label: 'Support',
          items: [
            { path: '/complaints', icon: <AlertCircle size={20} />, label: 'Complaints Portal' },
          ]
        },
        {
          type: 'group',
          label: 'Account',
          items: [
            { path: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
          ]
        }
      ]
    }
    
    // Admin & Management specific
    if (['admin', 'hod', 'dean', 'principal'].includes(role)) {
      const items = [
        { type: 'item', path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        {
          type: 'group',
          label: 'User Management',
          items: [
            { path: '/users', icon: <Users size={20} />, label: 'Students & Staff' },
            { path: '/faculty-management', icon: <Briefcase size={20} />, label: 'Faculty & Roles' },
          ]
        },
        {
          type: 'group',
          label: 'Academic Management',
          items: [
            { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
            { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
            { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
          ]
        },
        {
          type: 'group',
          label: 'Campus Management',
          items: [
            { path: '/events', icon: <Ticket size={20} />, label: 'Events' },
            { path: '/opportunities', icon: <Briefcase size={20} />, label: 'Opportunities' },
          ]
        },
      ]

      const analyticsGroup = {
        type: 'group',
        label: 'Analytics',
        items: [
          { path: '/analytics', icon: <TrendingUp size={20} />, label: 'Academic Analytics' },
          { path: '/placements/analytics', icon: <TrendingUp size={20} />, label: 'Placement Analytics' }
        ]
      }
      items.push(analyticsGroup)

      items.push({
        type: 'group',
        label: 'Support',
        items: [
          { path: '/complaints', icon: <AlertCircle size={20} />, label: 'Complaints Portal' }
        ]
      })

      if (role === 'admin') {
        items.push({
          type: 'group',
          label: 'Administration',
          items: [
            { path: '/upload-data', icon: <Database size={20} />, label: 'Data Management' },
            { path: '/placements/upload', icon: <Upload size={20} />, label: 'Upload Placements' },
            { path: '/settings', icon: <Settings size={20} />, label: 'Settings' }
          ]
        })
      } else {
        items.push({
          type: 'group',
          label: 'Administration',
          items: [
            { path: '/settings', icon: <Settings size={20} />, label: 'Settings' }
          ]
        })
      }

      return items
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
    if (['admin', 'hod', 'dean', 'principal'].includes(role)) return '/admin'
    return ''
  }

  const basePath = getBasePath()

  return (
    <div
      className={`hidden md:flex bg-[#0f172a] text-white transition-all duration-300 flex-col border-r border-gray-800 shadow-xl ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-sm tracking-wide">Aditya University</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">A</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 custom-scrollbar">
        {menuItems.map((section, index) => (
          <SidebarSection key={index} section={section} basePath={basePath} sidebarOpen={sidebarOpen} />
        ))}
      </nav>

      {/* User Info / Logout Button */}
      <div className="p-3 border-t border-gray-800 bg-gray-900/50">
        {sidebarOpen ? (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-xl">
             <div className="flex items-center gap-3 min-w-0">
               <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                 <span className="text-white font-bold text-sm">
                   {user?.name?.charAt(0) || 'U'}
                 </span>
               </div>
               <div className="flex-1 min-w-0">
                 <p className="font-semibold text-sm truncate text-white">{user?.name}</p>
                 <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">{user?.role}</p>
               </div>
             </div>
             <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all group relative"
            title="Logout"
          >
            <LogOut size={20} />
            <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-gray-800">
              Logout
            </div>
          </button>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #475569; }
      `}} />
    </div>
  )
}

export default Sidebar