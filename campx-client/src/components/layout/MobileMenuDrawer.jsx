import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  X,
  Megaphone,
  FileText,
  Calendar,
  Users,
  Upload,
  Settings,
  LogOut,
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
} from 'lucide-react';

const MobileMenuDrawer = ({ isOpen, onClose, user, basePath }) => {
  const { logout } = useAuth();
  if (!user) return null;

  const role = user.role;

  // We group everything except the main 4 mapped in MobileBottomNav
  const getGroupedItems = () => {
    let groups = [];
    if (role === 'student') {
      groups = [
        {
          title: 'Career & Opportunities',
          items: [
            { path: '/opportunities', icon: <Briefcase size={20} />, label: 'Opportunities' },
            { path: '/placement-readiness', icon: <Target size={20} />, label: 'Placement Readiness' },
          ]
        },
        {
          title: 'Academics & Resources',
          items: [
            { path: '/class-updates', icon: <BookOpen size={20} />, label: 'Class Updates' },
            { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
            { path: '/calendar', icon: <Calendar size={20} />, label: 'Academic Calendar' },
          ]
        },
        {
          title: 'Campus Life',
          items: [
            { path: '/feed', icon: <Sparkles size={20} />, label: 'My Feed' },
            { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
            { path: '/faculty-connect', icon: <Users size={20} />, label: 'Faculty Connect' },
          ]
        },
        {
          title: 'Support & Settings',
          items: [
            { path: '/sos', icon: <ShieldAlert size={20} className="text-red-500" />, label: 'Campus SOS' },
            { path: '/complaints', icon: <AlertCircle size={20} />, label: 'Complaints & Grievances' },
            { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
            { path: '/profile', icon: <UserCircle size={20} />, label: 'My Profile' },
          ]
        }
      ];
    } else if (role === 'faculty') {
      groups = [
        {
          title: 'Teaching & Activities',
          items: [
            { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
            { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
            { path: '/activities', icon: <Calendar size={20} />, label: 'Academic Activities' },
          ]
        },
        {
          title: 'Support & Settings',
          items: [
            { path: '/analytics', icon: <TrendingUp size={20} />, label: 'Analytics' },
            { path: '/complaints', icon: <AlertCircle size={20} />, label: 'Complaints Portal' },
            { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
            { path: '/profile', icon: <UserCircle size={20} />, label: 'My Profile' },
          ]
        }
      ];
    } else if (['admin', 'hod', 'dean', 'principal'].includes(role)) {
      groups = [
        {
          title: 'Management',
          items: [
            { path: '/faculty-management', icon: <Briefcase size={20} />, label: 'Faculty & Roles' },
            { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
            { path: '/resources', icon: <FileText size={20} />, label: 'Resources' },
            { path: '/calendar', icon: <Calendar size={20} />, label: 'Academic Calendar' },
            { path: '/opportunities', icon: <Briefcase size={20} />, label: 'Opportunities' },
          ]
        },
        {
          title: 'Analytics & Support',
          items: [
            { path: '/analytics', icon: <TrendingUp size={20} />, label: 'Academic Analytics' },
            { path: '/placements/analytics', icon: <TrendingUp size={20} />, label: 'Placement Analytics' },
            { path: '/complaints', icon: <AlertCircle size={20} />, label: 'Complaints Portal' },
          ]
        }
      ];

      if (role === 'admin') {
        groups.push({
          title: 'System Settings',
          items: [
            { path: '/upload-data', icon: <Database size={20} />, label: 'Data Management' },
            { path: '/placements/upload', icon: <Upload size={20} />, label: 'Upload Placements' },
            { path: '/settings', icon: <Settings size={20} />, label: 'Settings' }
          ]
        });
      }
    }
    
    return groups;
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[70] transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-4/5 max-w-sm bg-gray-50 shadow-2xl z-[80] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
               <span className="text-white font-bold text-sm">
                 {user?.name?.charAt(0) || 'U'}
               </span>
             </div>
             <div>
               <p className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{user?.name}</p>
               <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user?.role}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">
          {getGroupedItems().map((group, groupIdx) => (
            <div key={groupIdx}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{group.title}</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {group.items.map((item, itemIdx) => (
                  <NavLink
                    key={itemIdx}
                    to={`${basePath}${item.path}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }`
                    }
                  >
                    <div className={location.pathname.startsWith(`${basePath}${item.path}`) ? 'text-blue-500' : 'text-gray-400'}>
                      {item.icon}
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Section */}
          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3.5 bg-red-50 text-red-600 font-semibold rounded-2xl active:bg-red-100 transition-colors"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenuDrawer;
