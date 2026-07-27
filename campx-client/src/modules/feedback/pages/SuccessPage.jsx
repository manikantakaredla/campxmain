import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { CheckCircle, LogOut } from 'lucide-react';

const SuccessPage = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-gray-500 mb-8">
          Your feedback has been successfully submitted. We appreciate your time and input in helping us improve our educational standards.
        </p>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          <LogOut size={18} />
          Logout & Exit
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
