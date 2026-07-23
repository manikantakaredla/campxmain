import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const SidebarSection = ({ section, basePath, sidebarOpen }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand if any child is active
  useEffect(() => {
    if (section.type === 'group') {
      const isActive = section.items.some(item => 
        location.pathname.startsWith(`${basePath}${item.path}`)
      );
      if (isActive) {
        setIsExpanded(true);
      }
    }
  }, [location.pathname, section, basePath]);

  if (section.type === 'item') {
    return (
      <NavLink
        to={`${basePath}${section.path}`}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
            isActive
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
          } ${!sidebarOpen && 'justify-center'}`
        }
        title={!sidebarOpen ? section.label : ''}
      >
        <span className={`${location.pathname === `${basePath}${section.path}` ? 'text-white' : ''}`}>
          {section.icon}
        </span>
        {sidebarOpen && <span className="flex-1 truncate">{section.label}</span>}
        
        {/* Tooltip for collapsed state */}
        {!sidebarOpen && (
          <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-gray-700">
            {section.label}
          </div>
        )}
      </NavLink>
    );
  }

  return (
    <div className="mb-2">
      {sidebarOpen ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors group"
        >
          <span>{section.label}</span>
          <ChevronDown 
            size={14} 
            className={`transition-transform duration-200 group-hover:text-gray-300 ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </button>
      ) : (
        <div className="flex justify-center py-2 relative group cursor-pointer" onClick={() => setIsExpanded(true)}>
           <div className="w-6 h-[2px] bg-gray-700 rounded-full group-hover:bg-gray-500 transition-colors"></div>
           {/* Tooltip for group name in collapsed mode */}
           <div className="absolute left-14 bg-gray-900 text-gray-300 font-semibold uppercase tracking-wider text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-gray-700">
            {section.label}
          </div>
        </div>
      )}

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded || !sidebarOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1">
          {section.items.map((item, index) => {
            const isActivePath = location.pathname.startsWith(`${basePath}${item.path}`);
            return (
            <NavLink
              key={index}
              to={`${basePath}${item.path}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                } ${!sidebarOpen && 'justify-center'}`
              }
              title={!sidebarOpen ? item.label : ''}
            >
              <span className={`${isActivePath ? 'text-blue-500' : ''}`}>
                {item.icon}
              </span>
              {sidebarOpen && <span className="flex-1 truncate text-sm">{item.label}</span>}
              
              {!sidebarOpen && (
                <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-gray-700">
                  {item.label}
                </div>
              )}
            </NavLink>
          )})}
        </div>
      </div>
    </div>
  );
};

export default SidebarSection;
