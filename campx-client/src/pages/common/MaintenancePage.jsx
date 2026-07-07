import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MaintenancePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings className="w-12 h-12 text-blue-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">System Update in Progress</h1>
        
        <p className="text-gray-600 mb-8 text-lg">
          We are currently performing scheduled maintenance to improve your experience. 
          Please try again later.
        </p>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800 font-medium">
            Note: The system update is running. Normal operations will resume shortly.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors w-full md:w-auto"
        >
          <LogOut size={18} />
          Return to Login
        </button>
      </div>
      
      <div className="mt-8 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} CampX. All rights reserved.
      </div>
    </div>
  );
};

export default MaintenancePage;
