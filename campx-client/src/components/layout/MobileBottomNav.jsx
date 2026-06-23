import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home,
  Megaphone,
  Briefcase,
  Calendar,
  UserCircle,
  MessageSquare
} from 'lucide-react';

const MobileBottomNav = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const role = user.role;
  const basePath = 
    role === 'student' ? '/student' :
    role === 'faculty' ? '/faculty' :
    ['admin', 'hod', 'dean', 'principal'].includes(role) ? '/admin' : '';

  const navItems = [
    { icon: <Home size={24} />, path: `${basePath}/dashboard`, label: 'Home' },
    { icon: <Megaphone size={24} />, path: `${basePath}/announcements`, label: 'Alerts' },
    { icon: <Briefcase size={24} />, path: `${basePath}/opportunities`, label: 'Jobs' },
    { icon: <MessageSquare size={24} />, path: `${basePath}/messages`, label: 'Chats' },
    { icon: <Calendar size={24} />, path: `${basePath}/calendar`, label: 'Events' },
    { icon: <UserCircle size={24} />, path: `${basePath}/profile`, label: 'Profile' }
  ];

  // Adjust for roles that don't have opportunities (e.g. faculty may not care about it directly here)
  // But we can keep it simple or conditionally render. Let's just render the same structure for simplicity 
  // or modify based on role. The user wants specific tabs.
  const filteredNavItems = role === 'student' || role === 'admin' 
    ? navItems 
    : navItems.filter(item => item.label !== 'Jobs');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe-area rounded-t-3xl overflow-x-auto">
      {filteredNavItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors duration-200 ${
              isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default MobileBottomNav;
