import React from 'react';

const ApplicationStatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Selected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Shortlisted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Applied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Interested':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

export default ApplicationStatusBadge;
