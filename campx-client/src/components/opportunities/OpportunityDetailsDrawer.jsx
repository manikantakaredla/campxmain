import React from 'react';
import { X, Building2, MapPin, DollarSign, Calendar, Link as LinkIcon, Download, Users } from 'lucide-react';

const OpportunityDetailsDrawer = ({ isOpen, onClose, opportunity, applicationStatus, onApply }) => {
  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">Opportunity Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
             {opportunity.companyLogo ? (
              <img src={opportunity.companyLogo} alt={opportunity.companyName} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl border border-blue-100 shadow-sm">
                {opportunity.companyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{opportunity.companyName}</h1>
              <p className="text-lg text-gray-600">{opportunity.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <DollarSign size={16} />
                <span className="text-sm font-medium">Package</span>
              </div>
              <p className="font-semibold text-gray-900">{opportunity.package || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <MapPin size={16} />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="font-semibold text-gray-900">{opportunity.location || 'Remote'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar size={16} />
                <span className="text-sm font-medium">Event Date</span>
              </div>
              <p className="font-semibold text-gray-900">{opportunity.eventDate ? new Date(opportunity.eventDate).toLocaleDateString() : 'TBA'}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <Calendar size={16} />
                <span className="text-sm font-medium">Deadline</span>
              </div>
              <p className="font-semibold text-red-700">{opportunity.registrationDeadline ? new Date(opportunity.registrationDeadline).toLocaleDateString() : 'TBA'}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
            <div className="prose prose-sm text-gray-600">
              {opportunity.description ? (
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              ) : (
                <p className="italic text-gray-400">No description provided.</p>
              )}
            </div>
          </div>

          {opportunity.eligibility && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users size={20} className="text-gray-400" />
                Eligibility Criteria
              </h3>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <ul className="space-y-2 text-sm text-gray-700">
                  {opportunity.eligibility.branches?.length > 0 && <li><span className="font-medium text-gray-900">Branches:</span> {opportunity.eligibility.branches.join(', ')}</li>}
                  {opportunity.eligibility.years?.length > 0 && <li><span className="font-medium text-gray-900">Batch Years:</span> {opportunity.eligibility.years.join(', ')}</li>}
                  {opportunity.eligibility.cgpa > 0 && <li><span className="font-medium text-gray-900">Min CGPA:</span> {opportunity.eligibility.cgpa}</li>}
                  <li><span className="font-medium text-gray-900">Backlogs:</span> {opportunity.eligibility.backlogAllowed ? 'Allowed' : 'Not Allowed'}</li>
                </ul>
              </div>
            </div>
          )}

          {opportunity.skillsRequired?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.skillsRequired.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {opportunity.applicationLink && (
            <div className="mb-8">
              <a href={opportunity.applicationLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 p-4 rounded-xl border border-blue-100">
                <LinkIcon size={20} />
                External Application Link
              </a>
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button 
            onClick={() => onApply(opportunity)}
            disabled={opportunity.status === 'Closed' || applicationStatus}
            className={`w-full py-3 px-4 font-bold rounded-xl shadow-sm transition-colors text-lg ${
              opportunity.status === 'Closed' || applicationStatus 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {applicationStatus ? `Status: ${applicationStatus}` : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailsDrawer;
