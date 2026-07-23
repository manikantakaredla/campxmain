import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = ({ actions }) => {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Quick Actions</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            to={action.path}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all duration-300 border shadow-sm hover:shadow-md hover:-translate-y-0.5 group ${action.className || 'bg-white border-gray-200 hover:border-blue-300'}`}
          >
            <div className={`transition-colors ${action.iconClassName || 'text-gray-500 group-hover:text-blue-600'}`}>
              {action.icon}
            </div>
            <span className={`text-sm font-semibold transition-colors ${action.textClassName || 'text-gray-700 group-hover:text-gray-900'}`}>
              {action.label}
            </span>
          </Link>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
      `}} />
    </div>
  );
};

export default QuickActions;
