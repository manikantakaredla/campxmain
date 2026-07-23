import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import MobileMenuDrawer from './MobileMenuDrawer';
import {
  Home,
  BookOpen,
  Building2,
  MessageSquare,
  Menu
} from 'lucide-react';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  if (!user) return null;

  const role = user.role;
  const basePath = 
    role === 'student' ? '/student' :
    role === 'faculty' ? '/faculty' :
    ['admin', 'hod', 'dean', 'principal'].includes(role) ? '/admin' : '';

  // The 5 static tabs
  const navItems = [
    { icon: <Home size={22} />, path: `${basePath}/dashboard`, label: 'Home' },
    // We map 'Academics' to something generic based on role. 
    // Student: timetable, Faculty: students, Admin: users
    { 
      icon: <BookOpen size={22} />, 
      path: role === 'student' ? `${basePath}/timetable` : role === 'faculty' ? `${basePath}/students` : `${basePath}/users`, 
      label: 'Academics' 
    },
    // Campus usually implies Events or Announcements
    { 
      icon: <Building2 size={22} />, 
      path: `${basePath}/events`, 
      label: 'Campus' 
    },
    // { icon: <MessageSquare size={22} />, path: `${basePath}/messages`, label: 'Messages' },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-between items-center z-[60] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe-area">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
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
            isDrawerOpen ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
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
