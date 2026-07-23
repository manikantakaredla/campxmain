import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import MobileMenuDrawer from './MobileMenuDrawer';
import {
  Home,
  BookOpen,
  Rss,
  Bell,
  Menu
} from 'lucide-react';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  React.useEffect(() => {
    const handleOpenDrawer = () => setIsDrawerOpen(true);
    window.addEventListener('openMobileDrawer', handleOpenDrawer);
    return () => window.removeEventListener('openMobileDrawer', handleOpenDrawer);
  }, []);
  
  if (!user) return null;

  const role = user.role;
  const basePath = 
    role === 'student' ? '/student' :
    role === 'faculty' ? '/faculty' :
    ['admin', 'hod', 'dean', 'principal'].includes(role) ? '/admin' : '';

  // Nav items split into left and right, with Feed in center
  const leftNavItems = [
    { icon: <Home size={22} />, path: `${basePath}/dashboard`, label: 'Home' },
    { 
      icon: <BookOpen size={22} />, 
      path: role === 'student' ? `${basePath}/timetable` : role === 'faculty' ? `${basePath}/students` : `${basePath}/users`, 
      label: 'Academics' 
    },
  ];

  const rightNavItems = [
    { icon: <Bell size={22} />, path: `${basePath}/announcements`, label: 'Alerts' },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-between items-center z-[60] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe-area px-2">
        {/* Left Items */}
        {leftNavItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-200 ${
                isActive ? 'text-blue-800' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Central Prominent Feed Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <NavLink
            to={`${basePath}/feed`}
            className={({ isActive }) =>
              `flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 ${
                isActive ? 'bg-blue-800 text-white scale-110' : 'bg-blue-800 text-white hover:bg-blue-900'
              }`
            }
          >
            <Rss size={26} />
          </NavLink>
        </div>

        {/* Right Items */}
        {rightNavItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-200 ${
                isActive ? 'text-blue-800' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        
        {/* More Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-200 ${
            isDrawerOpen ? 'text-blue-800' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Menu size={22} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>

      <MobileMenuDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        user={user} 
        basePath={basePath} 
      />
    </>
  );
};

export default MobileBottomNav;
