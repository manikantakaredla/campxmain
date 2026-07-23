import React, { useState, useRef, useEffect } from 'react';
import { Search, Megaphone, Calendar, FileText, Users, Briefcase, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role || 'student';
  const basePath = 
    role === 'student' ? '/student' :
    role === 'faculty' ? '/faculty' :
    ['admin', 'hod', 'dean', 'principal'].includes(role) ? '/admin' : '';

  // Static searchable areas (since no API changes are allowed)
  const quickLinks = [
    { title: 'Search Announcements', icon: <Megaphone size={16} />, path: `${basePath}/announcements` },
    { title: 'Search Events', icon: <Calendar size={16} />, path: `${basePath}/events` },
    { title: 'Search Resources', icon: <FileText size={16} />, path: `${basePath}/resources` },
    { title: 'Search Opportunities', icon: <Briefcase size={16} />, path: `${basePath}/opportunities` },
    { title: 'Find Faculty', icon: <Users size={16} />, path: `${basePath}/faculty-connect`, roles: ['student'] },
    { title: 'Find Students', icon: <Users size={16} />, path: `${basePath}/students`, roles: ['faculty'] },
    { title: 'User Management', icon: <Users size={16} />, path: `${basePath}/users`, roles: ['admin', 'hod', 'dean', 'principal'] },
  ];

  // Filter based on role
  const availableLinks = quickLinks.filter(link => !link.roles || link.roles.includes(role));

  // Filter based on query
  const filteredLinks = query.length > 0 
    ? availableLinks.filter(link => link.title.toLowerCase().includes(query.toLowerCase()))
    : availableLinks;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div className="relative w-full max-w-md hidden sm:block" ref={searchRef}>
      <div 
        className={`flex items-center bg-gray-100 rounded-full px-4 py-2 border transition-all ${
          isOpen ? 'border-blue-400 bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-transparent hover:bg-gray-200'
        }`}
      >
        <Search size={18} className={`mr-2 transition-colors ${isOpen ? 'text-blue-500' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Search campus, resources, people..."
          className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        
        {/* Keyboard shortcut hint */}
        {!isOpen && !query && (
          <div className="hidden lg:flex items-center gap-1 text-[10px] font-medium text-gray-400 border border-gray-300 rounded px-1.5 py-0.5">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top">
          {query.length > 0 ? (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Results
              </div>
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(link.path)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {link.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{link.title}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No results found for "<span className="font-semibold text-gray-700">{query}</span>"
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {availableLinks.slice(0, 6).map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(link.path)}
                    className="flex items-center gap-2 p-2.5 hover:bg-gray-50 rounded-xl transition-colors group text-left"
                  >
                    <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                      {link.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 truncate">{link.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
