import React from 'react';
import { X, User, Briefcase, Calendar, GraduationCap, Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const PlacementDetailsModal = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold leading-6">Placement Details</h3>
                <p className="text-xs text-gray-300">Detailed student placement information</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            
            {/* Student Profile Overview */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl shadow-sm flex-shrink-0">
                {record.studentName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-gray-900 truncate">{record.studentName}</h4>
                <p className="text-sm text-gray-500 font-mono">{record.rollNumber}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><GraduationCap size={13}/>{record.department || 'N/A'} • {record.batch || 'N/A'}</span>
                  <span className="flex items-center gap-1"><MapPin size={13}/>{record.college || 'Aditya University'}</span>
                </div>
              </div>
              <div className="mt-2 md:mt-0 flex-shrink-0">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  record.offerType === 'Internship' 
                    ? 'bg-purple-50 text-purple-700 border-purple-100' 
                    : record.offerType === 'PPO' 
                      ? 'bg-amber-50 text-amber-700 border-amber-100' 
                      : 'bg-green-50 text-green-700 border-green-100'
                }`}>
                  {record.offerType || 'Placement'}
                </span>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Placement Details Card */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-gray-400" /> Career Details
                </h5>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Company Name</span>
                    <span className="font-semibold text-gray-900">{record.companyName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Designation / Role</span>
                    <span className="font-semibold text-gray-900">{record.role || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Compensation Package</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 mt-0.5">
                      ₹{record.package} LPA
                    </span>
                  </div>
                </div>
              </div>

              {/* Recruitment Timeline & Status */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" /> Timeline & Status
                </h5>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Placement Year</span>
                    <span className="font-semibold text-gray-900">{record.placementYear}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Placement Date</span>
                    <span className="font-semibold text-gray-900">{formatDate(record.offerDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Offer Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold mt-0.5 ${
                      record.offerStatus === 'Joined' 
                        ? 'bg-blue-100 text-blue-800' 
                        : record.offerStatus === 'Selected' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.offerStatus || 'Selected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Contact Details */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-4 md:col-span-2">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User size={14} className="text-gray-400" /> Student Profile Info
                </h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-gray-500 block text-[10px]">Email Address</span>
                      <span className="font-medium text-gray-900 truncate block">{record.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 block text-[10px]">Mobile Number</span>
                      <span className="font-medium text-gray-900">{record.mobileNumber || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 block text-[10px]">Gender</span>
                      <span className="font-medium text-gray-900 capitalize">{record.gender || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Profiles Section */}
              <div className="border border-gray-100 rounded-xl p-4 md:col-span-2 space-y-3">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FaLinkedin size={14} className="text-gray-400" /> Professional Profiles
                </h5>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-blue-900 block font-medium">LinkedIn Profile URL</span>
                    {record.linkedinUrl ? (
                      <a 
                        href={record.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Open LinkedIn Profile"
                        className="text-sm text-blue-600 hover:text-blue-800 break-all font-mono underline hover:no-underline"
                      >
                        {record.linkedinUrl}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No LinkedIn profile URL provided.</span>
                    )}
                  </div>
                  
                  {record.linkedinUrl ? (
                    <a
                      href={record.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open LinkedIn Profile"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                      <FaLinkedin size={16} />
                      <span>View LinkedIn Profile</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      title="Open LinkedIn Profile"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed border border-gray-200"
                    >
                      <FaLinkedin size={16} />
                      <span>View LinkedIn Profile</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PlacementDetailsModal;
